import React, { useState, useEffect } from 'react';
import { useApi, discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { FieldExtensionComponentProps } from '@backstage/plugin-scaffolder-react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { FormFieldBlueprint, createFormField } from '@backstage/plugin-scaffolder-react/alpha';

// --- 1. GitHub Repository Picker ---
export const GitHubRepoPicker = ({
  onChange,
  rawErrors,
  required,
  formData,
}: FieldExtensionComponentProps<string>) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [options, setOptions] = useState<{ id: string; name: string; fullName: string; language: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);

    (async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('azure-deploy');
        const res = await fetchApi.fetch(`${baseUrl}/github-repos`);
        if (!res.ok) {
          throw new Error(`Failed to load GitHub repositories: ${res.statusText}`);
        }
        const data = await res.json();
        if (active) {
          setOptions(data.repos || []);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [discoveryApi]);

  const selected = options.find(o => o.fullName === formData) || (formData ? { id: formData, name: formData, fullName: formData, language: '' } : null);

  return (
    <Autocomplete
      id="github-repo-picker"
      options={options}
      getOptionLabel={opt => opt.fullName || ''}
      value={selected}
      loading={loading}
      onChange={(_event, value) => onChange(value ? value.fullName : '')}
      renderInput={params => (
        <TextField
          {...params}
          label="Select Existing GitHub Application Repository"
          placeholder="Search and select your application repository..."
          variant="outlined"
          required={required}
          error={Boolean(rawErrors?.length || error)}
          helperText={error || 'Select the repository containing your application code to deploy'}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={opt => (
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
          <Typography variant="body2" style={{ fontWeight: 600 }}>
            {opt.fullName}
          </Typography>
          {opt.language ? <Chip label={opt.language} size="small" variant="outlined" /> : null}
        </Box>
      )}
    />
  );
};

// --- 2. Azure Resource Group Picker ---
export const AzureResourceGroupPicker = ({
  onChange,
  rawErrors,
  required,
  formData,
}: FieldExtensionComponentProps<string>) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [options, setOptions] = useState<{ id: string; name: string; location: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    setLoading(true);

    (async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('azure-deploy');
        const res = await fetchApi.fetch(`${baseUrl}/resource-groups`);
        if (!res.ok) {
          throw new Error(`Failed to load Resource Groups: ${res.statusText}`);
        }
        const data = await res.json();
        if (active) {
          setOptions(data.resourceGroups || []);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [discoveryApi, fetchApi]);

  const selected = options.find(o => o.name === formData) || (formData ? { id: formData, name: formData, location: '' } : null);

  return (
    <Autocomplete
      id="azure-rg-picker"
      options={options}
      getOptionLabel={opt => opt.name || ''}
      value={selected}
      loading={loading}
      onChange={(_event, value) => onChange(value ? value.name : '')}
      renderInput={params => (
        <TextField
          {...params}
          label="Azure Resource Group"
          placeholder="Select an Azure Resource Group..."
          variant="outlined"
          required={required}
          error={Boolean(rawErrors?.length || error)}
          helperText={error || 'Choose the Azure Resource Group containing your App Services'}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={opt => (
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
          <Typography variant="body2">{opt.name}</Typography>
          {opt.location ? <Chip label={opt.location} size="small" variant="outlined" /> : null}
        </Box>
      )}
    />
  );
};

// --- 3. Azure Web App Picker ---
export const AzureWebAppPicker = ({
  onChange,
  rawErrors,
  required,
  formData,
  formContext,
}: FieldExtensionComponentProps<string>) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [options, setOptions] = useState<{ id: string; name: string; resourceGroup: string; state: string; defaultHostName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const selectedRg = formContext?.formData?.resourceGroup;

  useEffect(() => {
    let active = true;
    setLoading(true);

    (async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('azure-deploy');
        const url = selectedRg
          ? `${baseUrl}/web-apps?resourceGroup=${encodeURIComponent(selectedRg)}`
          : `${baseUrl}/web-apps`;

        const res = await fetchApi.fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to load Azure Web Apps: ${res.statusText}`);
        }
        const data = await res.json();
        if (active) {
          setOptions(data.webApps || []);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [discoveryApi, selectedRg]);

  const selected = options.find(o => o.name === formData) || (formData ? { id: formData, name: formData, resourceGroup: '', state: '', defaultHostName: '' } : null);

  return (
    <Autocomplete
      id="azure-web-app-picker"
      options={options}
      getOptionLabel={opt => opt.name || ''}
      value={selected}
      loading={loading}
      onChange={(_event, value) => onChange(value ? value.name : '')}
      renderInput={params => (
        <TextField
          {...params}
          label="Target Azure Web App (App Service)"
          placeholder="Select the destination Azure Web App..."
          variant="outlined"
          required={required}
          error={Boolean(rawErrors?.length || error)}
          helperText={error || 'The active Azure Web App where your application will be deployed'}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={opt => (
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
          <Box>
            <Typography variant="body2" style={{ fontWeight: 600 }}>{opt.name}</Typography>
            <Typography variant="caption" color="textSecondary">{opt.defaultHostName || `${opt.name}.azurewebsites.net`}</Typography>
          </Box>
          <Chip
            label={opt.state || 'Running'}
            size="small"
            style={{
              backgroundColor: opt.state === 'Running' ? '#e6f9f3' : '#f5f5f5',
              color: opt.state === 'Running' ? '#00a372' : '#757575',
              fontWeight: 700,
            }}
          />
        </Box>
      )}
    />
  );
};

// --- Module Registration for Backstage Scaffolder ---
export const azureDeployPickersModule = createFrontendModule({
  pluginId: 'scaffolder',
  extensions: [
    FormFieldBlueprint.make({
      name: 'gitHubRepoPicker',
      params: {
        field: async () => createFormField({
          name: 'GitHubRepoPicker',
          component: GitHubRepoPicker,
        }),
      },
    }),
    FormFieldBlueprint.make({
      name: 'azureResourceGroupPicker',
      params: {
        field: async () => createFormField({
          name: 'AzureResourceGroupPicker',
          component: AzureResourceGroupPicker,
        }),
      },
    }),
    FormFieldBlueprint.make({
      name: 'azureWebAppPicker',
      params: {
        field: async () => createFormField({
          name: 'AzureWebAppPicker',
          component: AzureWebAppPicker,
        }),
      },
    }),
  ],
});
