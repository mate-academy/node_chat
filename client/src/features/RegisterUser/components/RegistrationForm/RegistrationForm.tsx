import { useState } from "react";
import { Button, Stack, Form, Row, Col, Alert } from "react-bootstrap";
import { RegistrationRequestType } from "../../types/registrarionTypes";
import { useAppDispatch, useAppSelector } from "../../../../shared/hooks/reduxHooks";
import { useNavigate } from "react-router-dom";
import { register } from "../../../../entities/User/store/authThunks";
import { clearError } from '../../../../entities/User/store/userSlice'

export const RegistrationForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.user)
  const [formData, setFormData] = useState<RegistrationRequestType>({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(clearError());
    const result = await dispatch(register(formData))

    if ('error' in result) {
      return;
    };

    navigate('/chat')
  };

  const handleInputChange = (
    value: string,
    field: keyof RegistrationRequestType
  ) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  return (
    <div>
      <Form onSubmit={e => handleSubmit(e)}>
        <Row style={{ height: '85vh', justifyContent: 'center', paddingTop: "5%" }}>
          <Col xs={6}>
            <Stack gap={3}>
              <h2>Register</h2>
              <Form.Control
                type="text"
                placeholder="Name"
                onChange={(e) => handleInputChange(e.target.value, 'name')}
              />
              <Form.Control
                type="email"
                placeholder="Email"
                onChange={(e) => handleInputChange(e.target.value, 'email')}
              />
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={(e) => handleInputChange(e.target.value, 'password')}
              />
              <Button variant="primary" type="submit">
                {loading ? 'Creating your account' : 'Register'}
              </Button>

              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}
            </Stack>
          </Col>
        </Row>
      </Form>
    </div >
  );
}