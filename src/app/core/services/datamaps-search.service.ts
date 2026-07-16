import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DataMap, SearchResponse, ExplainResponse } from '../../shared/models/data-map.model';

@Injectable({ providedIn: 'root' })
export class DatamapsSearchService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getList(busNo = 1126000333, divisionId = 1, top = 20): Observable<DataMap[]> {
    return this.http
      .get<{ dataMaps: DataMap[]; total: number; returned: number }>(
        `${this.apiUrl}/datamaps`,
        {
          params: { busNo: busNo.toString(), divisionId: divisionId.toString(), top: top.toString() }
        }
      )
      .pipe(
        map(response => response.dataMaps),
        catchError(error => {
          console.error('Error fetching DataMaps:', error);
          return of([]);
        })
      );
  }

  search(prompt: string, busNo = 1126000333, divisionId = 1): Observable<SearchResponse> {
    return this.http
      .post<SearchResponse>(
        `${this.apiUrl}/datamaps/search`,
        {
          prompt,
          busNo,
          divisionId
        }
      )
      .pipe(
        catchError(error => {
          console.error('Search error:', error);
          return of({
            success: false,
            query: prompt,
            results: [],
            totalResults: 0,
            error: error.message || 'An error occurred during search'
          });
        })
      );
  }

  explainDataMap(dataMapId: string): Observable<ExplainResponse> {
    return this.http
      .post<ExplainResponse>(
        `${this.apiUrl}/datamaps/explain/${dataMapId}`,
        {}
      )
      .pipe(
        catchError(error => {
          console.error('Explain error:', error);
          return of({
            success: false,
            dataMapId,
            dataMapName: '',
            explanation: '',
            error: error.message || 'An error occurred while generating explanation'
          });
        })
      );
  }

  getDataMapById(dataMapId: string): Observable<DataMap | null> {
    return this.http
      .get<{ success: boolean; dataMap: DataMap }>(`${this.apiUrl}/datamaps/${dataMapId}`)
      .pipe(
        map(response => response.dataMap),
        catchError(error => {
          console.error('Error fetching DataMap:', error);
          return of(null);
        })
      );
  }

  checkHealth(): Observable<any> {
    return this.http.get(`http://localhost:3000/health`);
  }
}
