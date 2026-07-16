const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

class BedrockService {
  constructor() {
    // Configure client
    // Support both AWS_ prefixed and non-prefixed env vars for flexibility
    const region = process.env.BEDROCK_REGION || process.env.AWS_REGION || "us-east-1";
    const bearerToken = process.env.BEDROCK_API_KEY || process.env.AWS_BEARER_TOKEN_BEDROCK;

    const clientConfig = {
      region: region,
      // Disable credential providers when using API key
      credentials: bearerToken ? {
        accessKeyId: 'NONE',
        secretAccessKey: 'NONE'
      } : undefined
    };

    this.client = new BedrockRuntimeClient(clientConfig);

    // Add bearer token middleware for Bedrock API key authentication
    // API keys use Bearer token authentication, NOT IAM credentials
    if (bearerToken) {
      this.client.middlewareStack.add(
        (next) => async (args) => {
          // Add Authorization header with Bearer token
          if (!args.request.headers) {
            args.request.headers = {};
          }
          args.request.headers["Authorization"] = `Bearer ${bearerToken}`;
          return next(args);
        },
        {
          name: "addBearerToken",
          step: "build",
          priority: "high"
        }
      );
      console.log("✅ Using Bedrock API Key authentication (Bearer Token)");
    } else {
      console.log("✅ Using default AWS credentials (IAM/SSO)");
    }

    // Use cross-region inference profile for Claude Sonnet 4.5
    this.modelId = "us.anthropic.claude-sonnet-4-5-20250929-v1:0";
  }

  async invokeModel(prompt, systemPrompt = null) {
    const messages = [
      {
        role: "user",
        content: prompt
      }
    ];

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      messages: messages,
      temperature: 0.7
    };

    if (systemPrompt) {
      payload.system = systemPrompt;
    }

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload)
    });

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return {
        success: true,
        content: responseBody.content[0].text,
        usage: responseBody.usage
      };
    } catch (error) {
      console.error("Bedrock invocation error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async searchDataMaps(query, dataMaps) {
    const systemPrompt = `You are an intelligent search assistant for a DataMaps system. Your job is to analyze natural language search queries and return relevant DataMaps.

DataMaps contain configuration data, mappings, scripts, and business rules. Each DataMap has:
- dataMapName: The name of the DataMap
- description: What the DataMap is used for
- createdDate: When it was created (ISO 8601 format)
- updatedDate: When it was last updated (ISO 8601 format)
- numberOfEntries: Number of key-value pairs
- sizeInBytes: Size in bytes
- keyValuePairs: Array of key-value items with metadata
- entity: Type like "skills", "agents", "queues", "teams", etc.
- entityType: "ACD", "general", etc.

When given a search query, you should:
1. Understand the user's intent (what are they looking for?)
2. Handle time-based queries like:
   - "last 7 entries" - return the 7 most recently updated DataMaps
   - "last month" - return DataMaps created/updated in the last month
   - "recent" or "latest" - return recently updated DataMaps
3. Handle entity-based queries like:
   - "ACD data maps" - return DataMaps with entityType="ACD"
   - "skills" - return DataMaps with entity="skills"
4. Match against dataMapName, description, and keyValuePairs content
5. Consider semantic similarity, not just keyword matching
6. For time-based queries, sort by updatedDate (newest first)
7. For limit queries like "last 7", return only that many results
8. Return the most relevant DataMap names in order of relevance

Today's date is ${new Date().toISOString().split('T')[0]}.

Respond with ONLY a JSON array of DataMap names, ordered by relevance (most relevant first).
Example: ["DataMapName1", "DataMapName2", "DataMapName3"]

If no DataMaps are relevant, return an empty array: []`;

    const dataMapsSummary = dataMaps.map(dm => ({
      dataMapName: dm.dataMapName,
      description: dm.description,
      divisionId: dm.divisionId,
      createdDate: dm.createdDate,
      updatedDate: dm.updatedDate,
      numberOfEntries: dm.numberOfEntries || (dm.keyValuePairs || dm.keyValuePair || []).length,
      sizeInBytes: dm.sizeInBytes,
      keyValuePairs: (dm.keyValuePairs || dm.keyValuePair || []).map(kv => ({
        name: kv.name,
        dataType: kv.dataType,
        entity: kv.entity,
        entityType: kv.entityType
      }))
    }));

    const prompt = `Search Query: "${query}"

Available DataMaps:
${JSON.stringify(dataMapsSummary, null, 2)}

Return the relevant DataMap names as a JSON array, ordered by relevance.`;

    const result = await this.invokeModel(prompt, systemPrompt);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        results: []
      };
    }

    try {
      const cleanedContent = result.content.trim();
      const jsonMatch = cleanedContent.match(/\[.*\]/s);
      const relevantNames = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      const orderedResults = relevantNames
        .map(name => dataMaps.find(dm => dm.dataMapName === name))
        .filter(dm => dm !== undefined);

      return {
        success: true,
        query: query,
        results: orderedResults,
        totalResults: orderedResults.length,
        usage: result.usage
      };
    } catch (parseError) {
      console.error("Failed to parse Bedrock response:", parseError);
      return {
        success: false,
        error: "Failed to parse AI response",
        results: []
      };
    }
  }

  async explainDataMap(dataMap) {
    const systemPrompt = "You are a helpful assistant that explains DataMaps in clear, simple language. Be concise but informative.";

    const keyValuePairs = dataMap.keyValuePairs || dataMap.keyValuePair || [];
    const prompt = `Explain this DataMap in 2-3 sentences:

Name: ${dataMap.dataMapName}
Description: ${dataMap.description}
Division ID: ${dataMap.divisionId}
Number of Items: ${keyValuePairs.length}
Key-Value Pairs: ${JSON.stringify(keyValuePairs, null, 2)}

Provide a clear, business-friendly explanation of what this DataMap does and when it would be used.`;

    const result = await this.invokeModel(prompt, systemPrompt);

    if (result.success) {
      return {
        success: true,
        dataMapId: dataMap.dataMapId || dataMap.dataMapName,
        dataMapName: dataMap.dataMapName,
        explanation: result.content
      };
    }

    return {
      success: false,
      error: result.error
    };
  }
}

module.exports = BedrockService;
