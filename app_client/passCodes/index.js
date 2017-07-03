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

const PasscodeFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
    </Filter>
);

export const PassCodeList = (props) => (
    <List {...props} filters={<PasscodeFilter />}>
        <Datagrid>
            <TextField source="passCode_id" label="PassCode Id"/>
            <TextField source="email" label="Email"/>
            <TextField source="passCode" label="PassCode"/>
            <BooleanField source="isValid" label="Activated"/>
            <TextField source="createAt" label="Created At"/>
        </Datagrid>
    </List>
);


// export const CategoryCreate = (props) => (
//     <Create {...props}>
//         <SimpleForm>
//             <TextInput source="name" validate={[required]}/>
//         </SimpleForm>
//     </Create>
// );
// const CategoryTitle = ({ record }) => {
//     return <span>Category {record ? `"${record.name}"` : ''}</span>;
// };
// export  const CategoryEdit = (props) => (
//     <Edit title={<CategoryTitle />} {...props}>
//         <SimpleForm>
//             <DisabledInput label="Category Id" source="cate_id" />
//             <TextInput source="name" label="Category Name" validate={[required]}/>
//         </SimpleForm>
//     </Edit>
// );