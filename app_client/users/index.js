import React from 'react';
import {
    Create,
    Edit,
    List,
    SimpleForm,
    DisabledInput,
    TextInput,
    DateInput,
    LongTextInput,
    ReferenceManyField,
    Datagrid,
    TextField,
    DateField,
    EditButton,
    DeleteButton,
    BooleanField,
    Filter,
    ReferenceInput,
    SelectInput
} from 'admin-on-rest';

import {required} from 'admin-on-rest'

const UserFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
    </Filter>
);

export const UserList = (props) => (
    <List {...props} filters={<UserFilter />}>
        <Datagrid>
            <TextField source="email" label="Email"/>
            <TextField source="createAt" label="Created At"/>
        </Datagrid>
    </List>
);
