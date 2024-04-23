import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, Form, Row, Col, Alert } from "react-bootstrap";

import { login } from '../../../../entities/User';
import { useAppDispatch, useAppSelector } from '../../../../shared/hooks/reduxHooks';
import { clearError } from '../../../../entities/User';

export const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.user)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSumbit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearError())
    const result = await dispatch(login(formData))

    if ('error' in result) {
      return;
    }

    navigate('/chat')
  }

  const handleOnChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  return (
    <div>
      <Form onSubmit={e => handleSumbit(e)}>
        <Row style={{ height: '85vh', justifyContent: 'center', paddingTop: "5%" }}>
          <Col xs={6}>
            <Stack gap={3}>
              <h2>Login</h2>
              <Form.Control
                type="email"
                placeholder="Email"
                onChange={e => handleOnChange('email', e.target.value)}
              />
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={e => handleOnChange('password', e.target.value)}
              />
              <Button variant="primary" type="submit">
                {loading ? 'In progress' : 'Login'}
              </Button>

              {error && <Alert variant="danger">{error}</Alert>}

            </Stack>
          </Col>
        </Row>
      </Form>
    </div>
  )
};
