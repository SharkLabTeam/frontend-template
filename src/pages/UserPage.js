import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient   } from 'react-query'
import toast, { Toaster } from 'react-hot-toast';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Box,
  Modal,
  TextField,
  InputAdornment,
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  // { id: 'isEmailVerifieds', label: 'Verified', alignRight: false },
  { id: 'walletAddress', label: 'Wallet Address', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

const token = JSON.parse(localStorage.getItem('userData'));
const tokenAccess = token?.tokens?.access?.token
const userdata = {
  name: '',
  email: '',
  password: '',
  walletAddress: '',
  role: 'admin'
}

const style = {
  position: 'absolute',
  borderRadius: '15px',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px #000',
  boxShadow: "5px 5px",
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItem: 'center',
  
};

const roles = [
  {
    value: 'admin',
    label: 'admin',
  },
  {
    value: 'halalCertificationIssuer',
    label: 'halal certification issuer',
  },
  {
    value: 'butcher',
    label: 'butcher',
  }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array?.map((el, index) => [el, index]);
  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis?.map((el) => el[0]);
}

export default function UserPage() {
  const queryClient = useQueryClient();

  const [indexData, setIndexData] = useState();

  const [open, setOpen] = useState(null);

  const [createUser, setCreateUser] = useState(userdata)

  const [page, setPage] = useState(0);

  const [openModal, setOpenModal] = useState(false);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [showPassword, setShowPassword] = useState(false);

  const handleCreateUser = (e) => {
    const { name, value } = e.target;
    setCreateUser(prevState => ({
        ...prevState,
        [name]: value
    }));
  };

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = data?.data?.users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const getUser = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/users?page=1&size=`,
    {
      headers: {
        Authorization: `Bearer ${tokenAccess}`, // Set the Authorization header
      },
    });
    return response
  };

  const { isLoading, isError, data, error } = useQuery('getUser', getUser)

  if (isError){
    toast(error)
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data?.data?.users.length) : 0;

  const filteredUsers = applySortFilter(data?.data?.users, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers?.length && !!filterName;

  const { mutate: postUser } = useMutation(
    async () => {
      toast.loading('Waiting...');
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
        email: createUser.email,
        password: createUser.password,
        name: createUser.name,
        role: createUser.role,
        walletAddress: createUser.walletAddress
      })

      return res
    },
    {
      onSuccess: (res) => {
        toast.dismiss();
        toast.success('Successfully Create User!');
        queryClient.invalidateQueries({ queryKey: ['getUser'] })
        setOpenModal(false)
        setCreateUser(userdata)
      },
      onError: (err) => {
        toast.dismiss();
        toast.error(err.response.data.message )
      },
    }
  );

  const { mutate: deleteUser } = useMutation(
    async () => {
      toast.loading('Waiting...');
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/users/${indexData.id}`,
      {
        headers: {
          Authorization: `Bearer ${tokenAccess}`, // Set the Authorization header
        },
      })
      return res
    },
    {
      onSuccess: (res) => {
        toast.dismiss();
        toast.success('Successfully delete');
        queryClient.invalidateQueries({ queryKey: ['getUser'] })
        handleCloseMenu(false)
      },
      onError: (err) => {
        toast.dismiss();
        toast.error('error!');
      },
    }
  );

  return (
    <>
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
      
      <Helmet>
        <title> User | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            User
          </Typography>
          <Button onClick={() => setOpenModal(true)} variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New User
          </Button>
        </Stack>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} plcHolder={"Search email..."} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={data?.data?.users.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, name, email, role, walletAddress} = row;
                    const selectedUser = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          {/* <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, name)} /> */}
                        </TableCell> 

                        <TableCell >
                          {/* <Stack direction="row" alignItems="center" spacing={2}> */}
                            {/* <Avatar variant="rounded" alt={name} src={avatarUrl} sx={{ width: 72, height: 72 }} /> */}
                            <Typography variant="subtitle2" noWrap>
                              {name}
                            </Typography>
                          {/* </Stack> */}
                        </TableCell>

                        <TableCell align="left">{email}</TableCell>

                        <TableCell align="left">{role}</TableCell>

                        <TableCell align="left">
                          <Label color={'success'}>
                            {walletAddress}
                          </Label>
                        </TableCell>

                        {/* <TableCell align="left">
                          <Label color={(isEmailVerified === false && 'error') || 'success'}>
                            {isEmailVerified ? sentenceCase(String('Yes')) : sentenceCase(String('No')) }
                          </Label>
                        </TableCell> */}

                        {/* <TableCell align="left">
                          <Label color={(isEmailVerified === 'banned' && 'error') || 'success'}>{sentenceCase(isEmailVerified)}</Label>
                        </TableCell> */}

                        <TableCell align="right" onClick={()=>{setIndexData(row)}}>
                          <IconButton size="large" color="inherit" onClick={handleOpenMenu}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data?.data?.users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        {/* <MenuItem>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem> */}

        <MenuItem sx={{ color: 'error.main' }} onClick={deleteUser}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      <Modal
        keepMounted
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <Typography id="keep-mounted-modal-title" variant="h6" component="h2" sx={{display: 'flex', justifyContent: 'center'}}>
            Create User
          </Typography>

          <Typography id="keep-mounted-modal-description" sx={{ mt: 2, marginBottom:'25px', display: 'flex', justifyContent: 'center' }}>
            Create a new user
          </Typography>

          <TextField value={createUser.name} name='name' onChange={handleCreateUser} fullWidth label="name" sx={{  marginBottom:'15px'}} />
          <TextField value={createUser.email} name='email' onChange={handleCreateUser} fullWidth label="Email" sx={{  marginBottom:'15px'}} />
          {/* <TextField value={createUser.password} name='password' onChange={handleCreateUser} fullWidth label="Password" sx={{  marginBottom:'15px'}} /> */}
          
          <TextField
            name="password"
            label="Password"
            onChange={handleCreateUser}
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
            sx={{  marginBottom:'15px'}}
          />

          <TextField value={createUser.walletAddress} name='walletAddress' onChange={handleCreateUser} fullWidth label="Wallet Address" sx={{  marginBottom:'15px'}} />

          <TextField
          id="outlined-select-currency"
          select
          label="Role"
          defaultValue={'admin'}
          helperText="Please select your role"
          sx={{  marginBottom:'15px'}}
          name='role'
          value={createUser.role} 
          onChange={handleCreateUser} 
          >
            {roles?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          
          {/* <Avatar 
            src={createUser.imageUrl}
            variant="rounded" 
            sx={{  marginBottom:'25px', width: '40%', height: '30%',
            left: '30%', }}
          /> */}

          {/* {imgUpload ?
              <Avatar 
              src={imgUpload} 
              variant="rounded" 
              sx={{  marginBottom:'25px', width: '40%', height: '30%',
              left: '30%', }}
              />
            
            :
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ marginBottom:'25px' }}
            >
              Import Image
              <input
                type="file"
                hidden
                onChange={handleUpload}
              />
            </Button>
          } */}

          <Button
            variant="text"
            component="label"
            fullWidth
            sx={{  mt: '20px'}}
            onClick={postUser}
            // onClose={() => setOpenModal(false)}
          >
            Create user
          </Button>
          
        </Box>
      </Modal>
    </>
  );
}
