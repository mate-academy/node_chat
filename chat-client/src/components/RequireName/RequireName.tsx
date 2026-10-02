import { Navigate, Outlet } from "react-router"

type Props = {
  name: string,
}

export const RequireName = ( { name }: Props) => {

  if (!name) {
    return <Navigate to="/login" replace />
  }

  return (
    <Outlet />
  )
}
