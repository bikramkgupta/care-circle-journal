export interface DailySummaryResult {
    summaryText: string;
    insightsJson: any;
    modelName: string;
}
export declare const generateDailySummary: (careProfileName: string, date: string, entries: any[]) => Promise<DailySummaryResult>;
//# sourceMappingURL=gradient.d.ts.map