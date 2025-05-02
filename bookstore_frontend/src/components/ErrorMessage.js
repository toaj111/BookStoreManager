import React from 'react';
import { Alert } from 'antd';

const ErrorMessage = ({ error }) => {
    if (!error) return null;

    let message = '发生错误';
    if (error.response?.data) {
        if (typeof error.response.data === 'string') {
            message = error.response.data;
        } else if (error.response.data.detail) {
            message = error.response.data.detail;
        } else if (error.response.data.non_field_errors) {
            message = error.response.data.non_field_errors[0];
        } else {
            // 处理字段错误
            const fieldErrors = Object.values(error.response.data).flat();
            message = fieldErrors[0];
        }
    }

    return (
        <Alert
            message="错误"
            description={message}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
        />
    );
};

export default ErrorMessage; 