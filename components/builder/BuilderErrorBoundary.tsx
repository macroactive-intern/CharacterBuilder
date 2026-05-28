"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type BuilderErrorBoundaryProps = {
  children: ReactNode;
};

type BuilderErrorBoundaryState = {
  hasError: boolean;
};

export default class BuilderErrorBoundary extends Component<
  BuilderErrorBoundaryProps,
  BuilderErrorBoundaryState
> {
  state: BuilderErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): BuilderErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Builder crashed.", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <section
              className="rounded-lg border border-red-200 bg-white p-6 shadow-sm"
              role="alert"
            >
              <p className="text-sm font-medium text-red-700">
                Character Builder
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                Something went wrong &mdash; reload
              </h1>
              <p className="mt-3 text-sm text-slate-600">
                The builder hit an unexpected error. Reloading will restart the
                current screen from the latest saved draft.
              </p>
              <button
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                onClick={() => window.location.reload()}
                type="button"
              >
                Reload
              </button>
            </section>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
