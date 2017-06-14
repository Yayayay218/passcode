import React from 'react';
import {render} from 'react-dom';
import {
    Admin, Resource, fetchUtils, Delete
} from 'admin-on-rest';

import {PassCodeList} from './passCodes/index';


import {Dashboard} from './dashboard';

//  Import REST APIs
import customRestClient from './rest/restClient';
import addUploadFeature from './rest/addUploadFeature';


const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({Accept: 'application/json'})
    }
    return fetchUtils.fetchJson(url, options);
};

const apiUrl = '/api';
const restClient = customRestClient(apiUrl, httpClient);
const uploadCapableClient = addUploadFeature(restClient);

render(
    <Admin restClient={uploadCapableClient} title="My Dashboard">
        <Resource name="passcode" list={PassCodeList} />
    </Admin>,
    document.getElementById('root')
);
