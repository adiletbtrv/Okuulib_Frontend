import type { AllWorksDTO, WorkResponse } from './interfaces';

export function getCoverUrl(work: WorkResponse | AllWorksDTO): string | undefined {
    if ('coverUrl' in work) return (work as WorkResponse).coverUrl;
    return (work as AllWorksDTO).imageUrl;
}

export function getAuthorName(work: WorkResponse | AllWorksDTO): string {
    if ('authorName' in work) return (work as AllWorksDTO).authorName || 'Unknown Author';
    if ('author' in work) return (work as WorkResponse).author?.name || 'Unknown Author';
    return 'Unknown Author';
}