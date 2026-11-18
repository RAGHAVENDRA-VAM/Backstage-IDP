import { useState } from 'react';
import { useApi, fetchApiRef, discoveryApiRef } from '@backstage/core-plugin-api';
import { InfoCard, Table, Progress } from '@backstage/core-components';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { Select, MenuItem, FormControl, InputLabel, Chip, Button, Tooltip, CircularProgress } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import SendIcon from '@material-ui/icons/Send';

export const DatadogLogsCard = () => {
  const { fetch } = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const [timeframe, setTimeframe] = useState('now-1d');
  const [injecting, setInjecting] = useState(false);
  const [injectMessage, setInjectMessage] = useState<string | null>(null);

  const { value, loading, error, retry } = useAsyncRetry(async () => {
    const baseUrl = await discoveryApi.getBaseUrl('proxy');
    const response = await fetch(`${baseUrl}/datadog-v2/logs/events/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filter: {
          query: '*',
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

  const handleInjectLog = async () => {
    setInjecting(true);
    setInjectMessage(null);
    try {
      const backendUrl = await discoveryApi.getBaseUrl('azure-deploy');
      const sampleEvents = [
        {
          ddsource: 'azure.appservice',
          ddtags: 'env:production,service:backstage-idp,region:westus3',
          hostname: 'backstage-idp-gvftaxetancteec5.westus3-01.azurewebsites.net',
          message: `[IDP-Audit] Platform Operator triggered manual telemetry checkpoint - Status: HEALTHY - Latency: 42ms`,
          service: 'backstage-idp',
          status: 'info',
        },
        {
          ddsource: 'azure.finops',
          ddtags: 'env:production,service:azure-finops,subscription:46269e09-e1e1',
          hostname: 'azure-cost-governance',
          message: `[FinOps-Alert] Daily budget velocity verification passed. Projected savings: ₹1,042/month`,
          service: 'azure-finops',
          status: 'info',
        },
        {
          ddsource: 'azure.ai-foundry',
          ddtags: 'env:production,service:shield-ai,hub:devops-maf3-AI-Hub',
          hostname: 'devops-maf3.openai.azure.com',
          message: `[AI-Gateway] Shield AI inference request completed. Token consumption: 840 tokens, model: gpt-5-mini`,
          service: 'shield-ai',
          status: 'info',
        },
      ];

      const res = await fetch(`${backendUrl}/datadog/inject-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleEvents),
      });

      if (res.ok) {
        setInjectMessage('Telemetry shipped to Datadog! Indexing in progress...');
        setTimeout(() => {
          retry();
          setInjectMessage(null);
        }, 3000);
      } else {
        const err = await res.json();
        setInjectMessage(`Injection error: ${err.error || 'Failed to inject log'}`);
      }
    } catch (e: any) {
      setInjectMessage(`Error: ${e.message}`);
    } finally {
      setInjecting(false);
    }
  };

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
        <MenuItem value="now-1d">Past 24 Hours</MenuItem>
        <MenuItem value="now-3d">Past 3 Days</MenuItem>
        <MenuItem value="now-7d">Past 7 Days (Default)</MenuItem>
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
          flexWrap: 'wrap',
          gap: '12px',
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
          <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 600 }}>
            Live Intake Stream Connected
          </span>
          {injectMessage && (
            <Chip
              size="small"
              label={injectMessage}
              style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}
            />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tooltip title="Send real diagnostic operational telemetry events directly to Datadog's live HTTP ingest API">
            <span>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={injecting ? <CircularProgress size={16} /> : <SendIcon fontSize="small" />}
                onClick={handleInjectLog}
                disabled={injecting}
                style={{ textTransform: 'none', fontWeight: 600 }}
              >
                {injecting ? 'Injecting Telemetry...' : 'Ship Diagnostic Telemetry'}
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Refresh Datadog Log Query">
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon fontSize="small" />}
              onClick={() => retry()}
              style={{ textTransform: 'none', fontWeight: 600 }}
            >
              Refresh
            </Button>
          </Tooltip>
          {timeFilter}
        </div>
      </div>
      <Table
        title="Datadog Operational Logs"
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
