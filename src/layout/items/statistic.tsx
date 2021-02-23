import React, { useCallback, useContext } from 'react';
import {
  StatisticChartOptions,
  StatisticMapOptions,
  StatisticPivotOptions,
} from '@ballware/meta-interface';
import {
  Chart,
  CommonSeriesSettings,
  Tooltip,
  Export,
  Series,
  Legend,
  ArgumentAxis,
  ConstantLine,
  ValueAxis,
} from 'devextreme-react/chart';
import { Map, Marker } from 'devextreme-react/map';
import { chartSeriesObject } from 'devextreme/viz/chart';
import moment from 'moment';
import { getByPath } from '@ballware/react-renderer';
import PivotGrid from 'devextreme-react/pivot-grid';
import { PivotGridDataSourceField } from 'devextreme/ui/pivot_grid/data_source';
import {
  ProviderFactoryContext,
  StatisticContext,
  PageContext,
  SettingsContext,
} from '@ballware/react-contexts';

export interface StatisticProps {
  identifier: string;
  params: Record<string, unknown>;
}

const MyStatisticElement = () => {
  const { googlekey } = useContext(SettingsContext);
  const { customParam } = useContext(PageContext);
  const { name, params, data, layout, argumentAxisCustomizeText } = useContext(
    StatisticContext
  );

  const onLegendClick = useCallback((e: { target?: chartSeriesObject }) => {
    if (e.target) {
      if (e.target.isVisible()) {
        e.target.hide();
      } else {
        e.target.show();
      }
    }
  }, []);

  const renderChart = useCallback(() => {
    if (layout && argumentAxisCustomizeText) {
      switch (layout.type) {
        case 'chart': {
          const options = layout.options as StatisticChartOptions;
          let seriesKey = 1;

          const onCustomizeArgumentAxisText = (e: { value: any }) => {
            return argumentAxisCustomizeText(e.value) ?? e.value;
          };

          let argumentLineKey = 1;
          let valueLineKey = 1;

          return (
            <Chart
              height={layout.height}
              title={layout.title ?? name}
              rotated={options.rotated ?? false}
              dataSource={data}
              onLegendClick={onLegendClick}
            >
              <CommonSeriesSettings argumentField={options.argumentField} />
              <Tooltip enabled />
              <Export
                enabled
                fileName={`${name}_${moment().format('YYYYMMDD')}`}
              />
              {options.argumentAxis && (
                <ArgumentAxis
                  argumentType={options.argumentAxis.argumentType}
                  visualRange={
                    options.argumentAxis.visualRangeTo
                      ? [
                          options.argumentAxis.visualRangeFrom ?? 0,
                          options.argumentAxis.visualRangeTo,
                        ]
                      : null
                  }
                  tickInterval={options.argumentAxis.tickInterval}
                  label={{
                    visible: true,
                    customizeText: onCustomizeArgumentAxisText,
                  }}
                >
                  {options.argumentAxis.lines?.map((l) => (
                    <ConstantLine
                      key={argumentLineKey++}
                      value={l.value}
                      color={l.color}
                      dashStyle={l.dashStyle}
                      label={l.labelText ? { text: l.labelText } : {}}
                    />
                  ))}
                </ArgumentAxis>
              )}
              {options.valueAxis && (
                <ValueAxis>
                  {options.valueAxis.lines?.map((l) => (
                    <ConstantLine
                      key={valueLineKey++}
                      value={l.value}
                      color={l.color}
                      dashStyle={l.dashStyle}
                      label={l.labelText ? { text: l.labelText } : {}}
                    />
                  ))}
                </ValueAxis>
              )}
              {options.legend && (
                <Legend
                  title={{ text: options.legend.title }}
                  horizontalAlignment={options.legend.horizontalAlignment}
                  verticalAlignment={options.legend.verticalAlignment}
                />
              )}
              {options.series?.map((s) => (
                <Series
                  key={seriesKey++}
                  type={s.type}
                  visible={s.visible ?? true}
                  name={s.name}
                  valueField={s.valueField}
                  label={{
                    visible: s.labelVisible,
                    format: { type: s.format, precision: s.precision },
                  }}
                />
              ))}
            </Chart>
          );
        }
        case 'map': {
          const options = layout.options as StatisticMapOptions;
          let markersKey = 1;

          return (
            <React.Fragment>
              {googlekey && (
                <Map
                  height={layout.height ?? '400px'}
                  width={'100%'}
                  autoAdjust
                  provider={'google'}
                  type={'hybrid'}
                  defaultZoom={30}
                  controls
                  apiKey={{ google: googlekey }}
                >
                  {data?.map((item) => (
                    <Marker
                      key={markersKey++}
                      location={[
                        getByPath(item, options.locationField) as {
                          lat: number;
                          lng: number;
                        },
                      ]}
                      tooltip={{ text: getByPath(item, options.tooltipField) }}
                    />
                  ))}
                </Map>
              )}
            </React.Fragment>
          );
        }
        case 'pivot': {
          const options = layout.options as StatisticPivotOptions;

          return (
            <PivotGrid
              allowSortingBySummary
              allowSorting
              allowExpandAll
              allowFiltering
              fieldChooser={{ enabled: true }}
              export={{
                enabled: true,
                fileName: `${layout.title}_${moment().format('YYYYMMDD')}`,
              }}
              showRowTotals={options.showRowTotals ?? false}
              showRowGrandTotals={options.showRowGrandTotals ?? false}
              dataSource={{
                retrieveFields: false,
                fields: options.fields?.map((f) => {
                  return {
                    caption: f.caption,
                    dataField: f.dataField,
                    dataType: f.dataType,
                    groupInterval: f.groupInterval,
                    area: f.area,
                    expanded: f.expanded,
                    showTotals: f.showTotals,
                    showGrandTotals: f.showGrandTotals,
                    summaryType: f.summaryType,
                    format: f.format
                      ? { type: f.format, precision: f.precision }
                      : null,
                    width: f.width,
                  } as PivotGridDataSourceField;
                }),
                store: data,
              }}
            />
          );
        }
      }
    } else {
      return <React.Fragment></React.Fragment>;
    }
  }, [layout, argumentAxisCustomizeText, data, googlekey, name, onLegendClick]);

  return (
    <React.Fragment>
      {name &&
        params &&
        layout &&
        data &&
        customParam &&
        argumentAxisCustomizeText &&
        renderChart()}
    </React.Fragment>
  );
};

const StatisticContainer = ({ identifier, params }: StatisticProps) => {
  const { StatisticProvider } = useContext(ProviderFactoryContext);

  return (
    <React.Fragment>
      {StatisticProvider && (
        <StatisticProvider identifier={identifier} params={params}>
          <MyStatisticElement />
        </StatisticProvider>
      )}
    </React.Fragment>
  );
};

export const Statistic = StatisticContainer;
