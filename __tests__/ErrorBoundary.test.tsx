// __tests__/ErrorBoundary.test.tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';

const ProblemChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test Explosion in Component Tree');
  }
  return <Text testID="child-content">Normal Content</Text>;
};

describe('ErrorBoundary Component', () => {
  // Silence console.error in tests during error throw
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children normally when no error occurs', () => {
    const { getByTestId } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(getByTestId('child-content')).toBeTruthy();
  });

  it('catches render error and displays fallback error UI with recovery button', () => {
    const { getByText, queryByTestId } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(queryByTestId('child-content')).toBeNull();
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('renders custom fallback element when provided', () => {
    const CustomFallback = <Text testID="custom-fallback">Custom Error Screen</Text>;

    const { getByTestId } = render(
      <ErrorBoundary fallback={CustomFallback}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByTestId('custom-fallback')).toBeTruthy();
  });

  it('resets error state when "Try Again" is pressed', () => {
    let throwError = true;
    const DynamicChild = () => {
      if (throwError) {
        throw new Error('Explosion');
      }
      return <Text testID="recovered-content">Recovered successfully</Text>;
    };

    const { getByText, queryByTestId, rerender } = render(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();

    // Fix the issue in child component
    throwError = false;

    // Press Try Again button
    fireEvent.press(getByText('Try Again'));

    rerender(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>
    );

    expect(queryByTestId('recovered-content')).toBeTruthy();
  });
});
