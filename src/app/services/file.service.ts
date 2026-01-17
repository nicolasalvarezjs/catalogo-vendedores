import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileService {
  // Reusa el file-service existente
  private apiUrl = 'https://sport-file-service-stage.up.railway.app';

  constructor(private http: HttpClient) {}

  uploadImage(file: File, type: string = 'images', entity?: string): Observable<string> {
    const formData = new FormData();
    const namedFile = this.withUuidName(file);
    formData.append('file', namedFile, namedFile.name);

    const params: any = { type };
    if (entity) params.entity = entity;

    // The service returns plain text (URL). Force text response and cast to string.
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      params,
      responseType: 'text',
    }) as unknown as Observable<string>;
  }

  uploadImages(
    files: File[],
    type: string = 'images',
    entity?: string
  ): Observable<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      const namedFile = this.withUuidName(file);
      formData.append('file', namedFile, namedFile.name);
    });

    const params: any = { type };
    if (entity) params.entity = entity;

    return this.http.post<{ urls: string[] }>(`${this.apiUrl}/upload-raw`, formData, {
      params,
    });
  }

  private static counter = 0;

  private withUuidName(file: File): File {
    const uuid = this.generateUuid();
    const extMatch = file.name.match(/\.([^.]+)$/);
    const ext = extMatch ? `.${extMatch[1]}` : '';
    const newName = `${uuid}${ext}`;
    return new File([file], newName, { type: file.type, lastModified: Date.now() });
  }

  private generateUuid(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    // Fallback: high-entropy concat (timestamp + counter + random)
    const rnd = Math.random().toString(36).slice(2, 10);
    const ts = Date.now().toString(36);
    const count = (FileService.counter++ % 1_000_000).toString(36);
    return `${ts}-${count}-${rnd}`;
  }

  deleteFiles(
    filenames: string[]
  ): Observable<{ deleted: string[]; notFound: string[] }> {
    return this.http.delete<{ deleted: string[]; notFound: string[] }>(`${this.apiUrl}/files`, {
      body: { filenames },
    });
  }
}