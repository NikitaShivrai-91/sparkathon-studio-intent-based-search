import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatamapsSearchService } from '../../core/services/datamaps-search.service';
import { DataMap } from '../../shared/models/data-map.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTooltipModule,
    DatePipe
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  prompt = '';
  results: DataMap[] = [];
  loading = false;
  loadingList = false;
  searched = false;
  searchQuery = '';
  totalResults = 0;
  tokenUsage: { input_tokens: number; output_tokens: number } | null = null;
  errorMessage = '';
  selectedDataMap: DataMap | null = null;
  explanation = '';
  loadingExplanation = false;

  displayedColumns = [
    'dataMapName', 'description', 'numberOfEntries',
    'status', 'updatedDate', 'sizeInBytes', 'actions'
  ];

  exampleQueries = [
    'show me last 7 entries of ACD data maps',
    'show me last month created data maps',
    'recent agent skills configurations',
    'find ACD skills data maps',
    'billing and team assignments'
  ];

  constructor(private searchService: DatamapsSearchService) {}

  ngOnInit(): void {
    this.loadingList = true;
    this.searchService.getList().subscribe({
      next: data => {
        this.results = data;
        this.loadingList = false;
      },
      error: () => {
        this.loadingList = false;
      }
    });
  }

  search() {
    if (!this.prompt.trim()) return;

    this.loading = true;
    this.searched = false;
    this.errorMessage = '';
    this.tokenUsage = null;
    this.explanation = '';
    this.selectedDataMap = null;

    this.searchService.search(this.prompt).subscribe({
      next: response => {
        if (response.success) {
          this.results = response.results;
          this.searchQuery = response.query;
          this.totalResults = response.totalResults;
          this.tokenUsage = response.usage || null;
        } else {
          this.errorMessage = response.error || 'Search failed';
          this.results = [];
        }
        this.loading = false;
        this.searched = true;
      },
      error: (error) => {
        this.errorMessage = error.message || 'An error occurred';
        this.results = [];
        this.loading = false;
        this.searched = true;
      }
    });
  }

  useExampleQuery(query: string) {
    this.prompt = query;
    this.search();
  }

  explainDataMap(dataMap: DataMap) {
    this.selectedDataMap = dataMap;
    this.loadingExplanation = true;
    this.explanation = '';

    const dataMapId = dataMap.dataMapId || dataMap.dataMapName;
    this.searchService.explainDataMap(dataMapId).subscribe({
      next: response => {
        if (response.success) {
          this.explanation = response.explanation;
        } else {
          this.explanation = response.error || 'Failed to generate explanation';
        }
        this.loadingExplanation = false;
      },
      error: () => {
        this.explanation = 'An error occurred while generating explanation';
        this.loadingExplanation = false;
      }
    });
  }

  clearSearch() {
    this.prompt = '';
    this.searched = false;
    this.errorMessage = '';
    this.tokenUsage = null;
    this.explanation = '';
    this.selectedDataMap = null;
    this.ngOnInit();
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
