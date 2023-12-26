import React from 'react';
import {render, screen} from '@testing-library/react';
import App from './App';
import userEvent from "@testing-library/user-event";



test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

describe('App tests', () => {
  test('console.log is when button i clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<App />);
    userEvent.click(screen.getByRole("button", {name: "Click here"}));
    expect(consoleSpy).toHaveBeenCalledWith('has been clicked');
  })
})

