import React from 'react';
import { Outlet } from 'react-router-dom';
import { Section, Container } from 'react-bulma-components';
import { NavBar } from '../../components/NavBar';

export function App() {
  return (
    <Section
      className="p-0 is-flex is-flex-direction-column has-background-light"
      style={{ height: '100vh' }}
      size="full"
    >
      <NavBar />

      <Container>
        <Outlet />
      </Container>
    </Section>
  );
}
