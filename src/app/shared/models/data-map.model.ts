export enum DataType {
  String = 'String',
  Int = 'Int',
  Double = 'Double',
  Long = 'Long',
  Object = 'Object',
  Array = 'Array',
  Bool = 'Bool',
  Json = 'Json',
  Float = 'Float',
  DateTime = 'DateTime',
  Guid = 'Guid'
}

export enum Entity {
  None = 'None',
  Skills = 'Skills',
  Agents = 'Agents',
  Queues = 'Queues',
  Hoursofoperations = 'Hoursofoperations',
  Teams = 'Teams'
}

export enum EntityType {
  None = 'None',
  ACD = 'ACD',
  File = 'File',
  General = 'General'
}

export interface DataMapKeyValueItem {
  name: string;
  value: any;
  dataType: DataType;
  entity: Entity;
  entityType: EntityType;
}

export interface DataMap {
  dataMapName: string;
  divisionId: number;
  description: string;
  isLocked: boolean;
  createdDate: string;
  updatedDate: string;
  numberOfEntries: number;
  sizeInBytes: number;
  keyValuePairs: DataMapKeyValueItem[];
  // Optional fields for backwards compatibility
  busNo?: number;
  blobName?: string;
  dataMapId?: string;
  createdById?: number;
  updatedById?: number;
  numberOfItems?: number;
  sizeUsed?: number;
  version?: number;
  keyValuePair?: DataMapKeyValueItem[]; // old format
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: DataMap[];
  totalResults: number;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: string;
}

export interface ExplainResponse {
  success: boolean;
  dataMapId: string;
  dataMapName: string;
  explanation: string;
  error?: string;
}
