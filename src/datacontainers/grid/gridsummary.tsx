import { GridLayout } from '@ballware/meta-interface';

export const createSummaryConfiguration = (gridLayout: GridLayout) => {
  return {
    totalItems: gridLayout.summaries
      ?.filter((s) => s.totalSummary)
      .map((s) => {
        return {
          column: s.dataMember,
          summaryType: s.summaryType,
          valueFormat: 'fixedPoint',
        };
      }),
    groupItems: gridLayout.summaries
      ?.filter((s) => s.groupSummary)
      .map((s) => {
        return {
          column: s.dataMember,
          summaryType: s.summaryType,
          valueFormat: 'fixedPoint',
        };
      }),
  };
};
