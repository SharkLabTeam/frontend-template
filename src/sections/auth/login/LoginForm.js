import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery, useMutation   } from 'react-query'
import toast, { Toaster } from 'react-hot-toast';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();

  const [userLogin, setUserLogin] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false);

  const handleUserLogin = (e) => {
    const { name, value } = e.target;
    setUserLogin(prevState => ({
        ...prevState,
        [name]: value
    }));
  };

  const { error, mutate: loginMutation } = useMutation(
    async () => {
      toast.loading('Waiting...');
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email: userLogin.email,
        password: userLogin.password,
      })

      return res
    },
    {
      onSuccess: (res) => {
        toast.dismiss();
        toast.success('Successfully login!');
        const jsonString = JSON.stringify(res.data);
        localStorage.setItem('userData', jsonString);
        navigate('/dashboard', { replace: true });
      },
      onError: (err) => {
        toast.dismiss();
        toast.error(err.response.data.message )
      },
    }
  );

  

  return (
    <>
      {/* <div>{data}</div> */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },

          // Default options for specific types
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />

      <Stack spacing={3}>
        <TextField onChange={handleUserLogin} name="email" label="Email address" />

        <TextField
          name="password"
          label="Password"
          onChange={handleUserLogin}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        {/* <Checkbox name="remember" label="Remember me" /> */}
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={loginMutation}>
        Login
      </LoadingButton>
    </>
  );
}
