"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[Preview ErrorBoundary]", error, errorInfo);
    }

    public componentDidUpdate(prevProps: Props) {
        if (prevProps.children !== this.props.children && this.state.hasError) {
            this.setState({
                hasError: false,
                error: null
            });
        }
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div
                    style={{
                        padding: '16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        fontSize: '14px'
                    }}
                >
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                        Preview Runtime Error
                    </h3>

                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                        {this.state.error?.message}
                    </pre>

                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{
                            marginTop: '12px',
                            padding: '6px 12px',
                            background: '#f87171',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry Preview
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}