import Axios from 'axios';
import { Annotation, RelationGroup, PdfAnnotations } from '../context';

const BASE_URL = 'http://localhost:8000';
const axios = Axios.create({
    baseURL: BASE_URL,
    headers: {
    'Access-Control-Allow-Origin': '*', // 允许所有来源访问（可根据需求修改）
    'Content-Type': 'application/json', // 设置请求头的 Content-Type
    'X-Auth-Request-Email': 'development_user@example.com'
    // 其他自定义的请求头，视需求而定
  },
})

export interface Token {
    x: number;
    y: number;
    height: number;
    width: number;
    text: string;
}

interface Page {
    index: number;
    width: number;
    height: number;
}

export interface PageTokens {
    page: Page;
    tokens: Token[];
}

function docURL(sha: string): string {
    return `/api/doc/${sha}`;
}

export function pdfURL(sha: string): string {
    return `${BASE_URL}${docURL(sha)}/pdf`;
}

export async function getTokens(sha: string): Promise<PageTokens[]> {
    return axios.get(`${docURL(sha)}/tokens`).then((r) => r.data);
}

export interface Label {
    text: string;
    color: string;
}

export async function getLabels(): Promise<Label[]> {
    return axios.get('/api/annotation/labels').then((r) => r.data);
}

export async function getRelations(): Promise<Label[]> {
    return axios.get('/api/annotation/relations').then((r) => r.data);
}

export interface PaperStatus {
    sha: string;
    name: string;
    annotations: number;
    relations: number;
    finished: boolean;
    junk: boolean;
    comments: string;
    completedAt?: Date;
}

export interface Allocation {
    papers: PaperStatus[];
    hasAllocatedPapers: boolean;
}

export async function setPdfComment(sha: string, comments: string) {
    return axios.post(`/api/doc/${sha}/comments`, comments);
}

export async function setPdfFinished(sha: string, finished: boolean) {
    return axios.post(`/api/doc/${sha}/finished`, finished);
}

export async function setPdfJunk(sha: string, junk: boolean) {
    return axios.post(`/api/doc/${sha}/junk`, junk);
}

export async function getAllocatedPaperStatus(): Promise<Allocation> {
    return axios.get('/api/annotation/allocation/info').then((r) => r.data);
}

export function saveAnnotations(sha: string, pdfAnnotations: PdfAnnotations): Promise<any> {
    return axios.post(`/api/doc/${sha}/annotations`, {
        annotations: pdfAnnotations.annotations,
        relations: pdfAnnotations.relations,
    });
}

export async function getAnnotations(sha: string): Promise<PdfAnnotations> {
    return axios.get(`/api/doc/${sha}/annotations`).then((response) => {
        const ann: PdfAnnotations = response.data;
        const annotations = ann.annotations.map((a) => Annotation.fromObject(a));
        const relations = ann.relations.map((r) => RelationGroup.fromObject(r));

        return new PdfAnnotations(annotations, relations);
    });
}
