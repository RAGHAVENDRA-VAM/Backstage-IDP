import { useState } from 'react';
import { useApi, fetchApiRef, discoveryApiRef } from '@backstage/core-plugin-api';
import { InfoCard, Table, Progress } from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { Select, MenuItem, FormControl, InputLabel, Chip } from '@material-ui/core';

export const DatadogLogsCard = () => {
  const { fetch } = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const [timeframe, setTimeframe] = useState('now-1d');

  const { value, loading, error } = useAsync(async () => {
    const baseUrl = await discoveryApi.getBaseUrl('proxy');
    const response = await fetch(`${baseUrl}/datadog-v2/logs/events/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filter: {
          query: '',
          from: timeframe,
          to: 'now',
        },
        page: { limit: 50 },
        sort: '-timestamp',
      }),
    });

    if (!response.ok) {
      throw new Error(`Datadog API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const rawLogs = data.data || [];

    return rawLogs.map((item: any) => {
      const attrs = item.attributes || {};
      const innerAttrs = attrs.attributes || {};
      const message =
        attrs.message ||
        innerAttrs.EventName ||
        innerAttrs.resource_name ||
        innerAttrs.category ||
        'Operational Log Event';

      return {
        id: item.id,
        timestamp: attrs.timestamp,
        service: attrs.service || innerAttrs.service || 'azure',
        status: (attrs.status || innerAttrs.level || 'info').toLowerCase(),
        message: typeof message === 'object' ? JSON.stringify(message) : String(message),
      };
    });
  }, [fetch, timeframe]);

  const columns = [
    {
      title: 'Timestamp',
      field: 'timestamp',
      type: 'datetime' as const,
      width: '180px',
    },
    {
      title: 'Service',
      field: 'service',
      width: '130px',
      render: (rowData: any) => (
        <Chip
          size="small"
          label={rowData.service}
          variant="outlined"
          style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}
        />
      ),
    },
    {
      title: 'Status',
      field: 'status',
      width: '100px',
      render: (rowData: any) => {
        const status = rowData.status || 'info';
        let color: 'default' | 'primary' | 'secondary' = 'default';
        let style = { backgroundColor: '#e0f2fe', color: '#0369a1' };
        if (status === 'error' || status === 'critical' || status === 'err') {
          style = { backgroundColor: '#fee2e2', color: '#b91c1c' };
        } else if (status === 'warn' || status === 'warning') {
          style = { backgroundColor: '#fef3c7', color: '#b45309' };
        } else if (status === 'info' || status === 'informational' || status === 'ok') {
          style = { backgroundColor: '#dcfce7', color: '#15803d' };
        }
        return (
          <Chip
            size="small"
            color={color}
            label={status.toUpperCase()}
            style={{ fontWeight: 'bold', fontSize: '0.7rem', ...style }}
          />
        );
      },
    },
    {
      title: 'Message',
      field: 'message',
    },
  ];

  const timeFilter = (
    <FormControl variant="outlined" size="small" style={{ minWidth: 160 }}>
      <InputLabel id="dd-timeframe-label">Timeframe</InputLabel>
      <Select
        labelId="dd-timeframe-label"
        label="Timeframe"
        value={timeframe}
        onChange={e => setTimeframe(e.target.value as string)}
      >
        <MenuItem value="now-15m">Past 15 Minutes</MenuItem>
        <MenuItem value="now-1h">Past 1 Hour</MenuItem>
        <MenuItem value="now-4h">Past 4 Hours</MenuItem>
        <MenuItem value="now-1d">Past 24 Hours (Default)</MenuItem>
        <MenuItem value="now-3d">Past 3 Days</MenuItem>
        <MenuItem value="now-7d">Past 7 Days</MenuItem>
        <MenuItem value="now-15d">Past 15 Days</MenuItem>
        <MenuItem value="now-30d">Past 30 Days</MenuItem>
      </Select>
    </FormControl>
  );

  if (loading && !value) {
    return <Progress />;
  }

  if (error) {
    return (
      <InfoCard title="Datadog Live Logs">
        <div style={{ color: '#ef4444', padding: '12px' }}>
          <strong>Error loading Datadog logs:</strong> {error.message}
        </div>
      </InfoCard>
    );
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              height: '10px',
              width: '10px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>
            Live Stream Connected
          </span>
        </div>
        {timeFilter}
      </div>
      <Table
        title="Datadog Logs"
        options={{
          search: true,
          paging: true,
          pageSize: 10,
          pageSizeOptions: [5, 10, 25, 50],
          padding: 'dense',
        }}
        columns={columns}
        data={value || []}
      />
    </div>
  );
};
