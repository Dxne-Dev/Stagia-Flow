import * as React from 'react'
import { Route, Navigate } from 'react-router-dom'
import { RequireAuth, RequireRole } from '@/lib/route-guards'
import AppLayout from '@/components/app-layout'

export interface RouteGuard {
  auth?: 'required' | 'admin' | 'stagiaire' | false
  requireOrg?: boolean
  layout?: boolean
}

function withGuards(Component: React.ComponentType, guards: RouteGuard) {
  let element = <Component />

  if (guards.layout !== false) {
    element = <AppLayout>{element}</AppLayout>
  }

  if (guards.auth === 'admin') {
    element = (
      <RequireRole roles={['admin', 'manager']} requireOrg={guards.requireOrg}>
        {element}
      </RequireRole>
    )
  } else if (guards.auth === 'stagiaire') {
    element = (
      <RequireRole roles={['stagiaire']}>
        {element}
      </RequireRole>
    )
  } else if (guards.auth === 'required') {
    element = <RequireAuth>{element}</RequireAuth>
  }

  return element
}

export function createRoute(path: string, Component: React.ComponentType, guards: RouteGuard = {}) {
  return (
    <Route
      key={path}
      path={path}
      element={withGuards(Component, guards)}
    />
  )
}

export const NotFoundRoute = (
  <Route key="*" path="*" element={<Navigate to="/" replace />} />
)
