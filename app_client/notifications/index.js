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

export const NotificationsCreate = (props) => (
    <Create {...props} title={'Push Notification'}>
        <SimpleForm>
            <TextInput source="title" label='Notification Title' validate={[required]}/>
            <TextInput source="text" label="Notification Text" validate={[required]}/>
            <SelectInput source="notificationType" label="Notification Type" allowEmpty choices={[
                {id: '0', name: 'Normal Notification'},
                {id: '2', name: 'Popup Notification'}
            ]}/>
            <TextInput source="notificationLink" label="Notification Link" validate={[required]}/>
        </SimpleForm>
    </Create>
);