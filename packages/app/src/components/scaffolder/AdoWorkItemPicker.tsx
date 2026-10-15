import React, { useState, useEffect } from 'react';
import { useApi, fetchApiRef, discoveryApiRef } from '@backstage/core-plugin-api';
import { FieldExtensionComponentProps } from '@backstage/plugin-scaffolder-react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';

export const AdoWorkItemPicker = ({
  onChange,
  rawErrors,
  required,
  formData,
  formContext,
}: FieldExtensionComponentProps<number>) => {
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  // Extract other fields from the form context (organization, project, type)
  const organization = formContext?.formData?.organization;
  const project = formContext?.formData?.project;
  const childType = formContext?.formData?.type;

  // Determine what type of parent to fetch based on the selected child type
  const getParentType = (type: string) => {
    switch (type) {
      case 'Feature': return 'Epic';
      case 'User Story': return 'Feature';
      case 'Task': return 'User Story';
      case 'Bug': return 'Feature';
      case 'Test Case': return 'User Story';
      default: return null;
    }
  };

  const parentType = childType ? getParentType(childType) : null;

  useEffect(() => {
    let active = true;

    if (!organization || !project || !parentType) {
      setOptions([]);
      return undefined;
    }

    setLoading(true);
    setError(undefined);

    (async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('ado-proxy');
        const url = `${baseUrl}/work-items?organization=${encodeURIComponent(
          organization,
        )}&project=${encodeURIComponent(project)}&type=${encodeURIComponent(parentType)}`;

        const response = await fetchApi.fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${parentType}s: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (active) {
          setOptions(data.workItems || []);
          setLoading(false);
        }
      } catch (e: any) {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [organization, project, parentType, fetchApi, discoveryApi]);

  // If there's no logical parent type (e.g. creating an Epic), hide this field or show disabled
  if (!parentType) {
    return (
      <TextField
        fullWidth
        disabled
        label="Parent Work Item"
        helperText={`No parent hierarchy mapping found for work item type: ${childType || 'Unknown'}`}
        variant="outlined"
      />
    );
  }

  const selectedOption = options.find((o) => o.id === formData) || null;

  return (
    <Autocomplete
      id="ado-work-item-picker"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      getOptionSelected={(option, value) => option.id === value.id}
      getOptionLabel={(option) => `${option.id} - ${option.title}`}
      options={options}
      loading={loading}
      value={selectedOption}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.id : undefined);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`Select Parent ${parentType}`}
          variant="outlined"
          required={required}
          error={(rawErrors?.length ?? 0) > 0 || !!error}
          helperText={error || `Select a parent ${parentType} for your new ${childType}`}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { FormFieldBlueprint, createFormField } from '@backstage/plugin-scaffolder-react/alpha';

export const AdoProjectPicker = ({
  onChange,
  rawErrors,
  required,
  formData,
  formContext,
}: FieldExtensionComponentProps<string>) => {
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const organization = formContext?.formData?.organization;

  useEffect(() => {
    let active = true;

    if (!organization) {
      setOptions([]);
      return undefined;
    }

    setLoading(true);
    setError(undefined);

    (async () => {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('ado-proxy');
        const url = `${baseUrl}/projects?organization=${encodeURIComponent(organization)}`;

        const response = await fetchApi.fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (active) {
          setOptions(data.projects || []);
          setLoading(false);
        }
      } catch (e: any) {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [organization, fetchApi, discoveryApi]);

  if (!organization) {
    return (
      <TextField
        fullWidth
        disabled
        label="Project"
        helperText="Please enter an Organization name first"
        variant="outlined"
      />
    );
  }

  const selectedOption = options.find((o) => o.name === formData) || null;

  return (
    <Autocomplete
      id="ado-project-picker"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      value={selectedOption}
      onChange={(_, newValue) => {
        onChange(newValue ? newValue.name : undefined);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Project"
          variant="outlined"
          required={required}
          error={(rawErrors?.length ?? 0) > 0 || !!error}
          helperText={error || "Select an Azure DevOps project"}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

export const adoWorkItemPickerModule = createFrontendModule({
  pluginId: 'scaffolder',
  extensions: [
    FormFieldBlueprint.make({
      name: 'adoWorkItemPicker',
      params: {
        field: async () => createFormField({
          name: 'AdoWorkItemPicker',
          component: AdoWorkItemPicker,
        }),
      },
    }),
    FormFieldBlueprint.make({
      name: 'adoProjectPicker',
      params: {
        field: async () => createFormField({
          name: 'AdoProjectPicker',
          component: AdoProjectPicker,
        }),
      },
    }),
  ],
});
