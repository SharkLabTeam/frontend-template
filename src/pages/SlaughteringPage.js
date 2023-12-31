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
  { label: 'No', alignRight: false },
  { id: 'slaughteringName', label: 'Slaughtering Name', alignRight: false },
  { id: 'slaughteringVideo', label: 'Slaughtering Video', alignRight: false },
  { id: 'meatId', label: 'Meat Id', alignRight: false },
  { id: 'isVerify', label: 'Is Verify', alignRight: false },
  { id: 'createdAt', label: 'Created At', alignRight: false },
  { id: 'updateAt', label: 'Update At', alignRight: false },
  {}
];

// ----------------------------------------------------------------------

const token = JSON.parse(localStorage.getItem('userData'));
const tokenAccess = token?.tokens?.access?.token
const slaughteringdata = {
  slaughteringName: '',
  meatId: '',
  slaughteringVideo: ''
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
    return filter(array, (_slaughtering) => _slaughtering.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis?.map((el) => el[0]);
}

export default function SlaughteringPage() {
  const queryClient = useQueryClient();

  const [indexData, setIndexData] = useState();

  const [open, setOpen] = useState(null);

  const [createSlaughtering, setCreateSlaughtering] = useState(slaughteringdata)

  const [page, setPage] = useState(0);

  const [openModal, setOpenModal] = useState(false);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [showPassword, setShowPassword] = useState(false);
  
  const [meatDropdown, setMeatDropdown] = useState([])

  const handleCreateSlaughtering = (e) => {
    const { name, value } = e.target;
    setCreateSlaughtering(prevState => ({
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
      const newSelecteds = data?.data?.slaughterings.map((n) => n.name);
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

  const getSlaughtering = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/slaughtering`,
    {
      headers: {
        Authorization: `Bearer ${tokenAccess}`, // Set the Authorization header
      },
    });
    return response
  };

  const getMeat = async () => {
    const {data} = await axios.get(`${process.env.REACT_APP_API_URL}/meats`,
    {
      headers: {
        Authorization: `Bearer ${tokenAccess}`, // Set the Authorization header
      },
    });
    
    const temp = data?.meats.map(meat => {
        return {
            value: meat.id,
            label: meat.meatName
        }
    })

    setMeatDropdown(temp)
  };

  const { isLoading, isError, data, error } = useQuery('getSlaughtering', getSlaughtering)

  if (isError){
    toast(error)
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data?.data?.slaughterings.length) : 0;

  const filteredSlaughterings = applySortFilter(data?.data?.slaughterings, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredSlaughterings?.length && !!filterName;

  const { mutate: postSlaughtering } = useMutation(
    async () => {
      toast.loading('Waiting...');
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/slaughtering`, 
      {
        slaughteringName: createSlaughtering.slaughteringName,
        meatId: createSlaughtering.meatId,
        slaughteringVideo: createSlaughtering.slaughteringVideo
      },
      {
        headers: {
          'Authorization': `Bearer ${tokenAccess}`, // Set the Authorization header
        },
      }
      )

      return res
    },
    {
      onSuccess: (res) => {
        toast.dismiss();
        toast.success('Successfully Create Slaughtering!');
        queryClient.invalidateQueries({ queryKey: ['getSlaughtering'] })
        setOpenModal(false)
        setCreateSlaughtering(slaughteringdata)
      },
      onError: (err) => {
        toast.dismiss();
        toast.error(err.response.data.message )
      },
    }
  );

  const { mutate: deleteSlaughtering } = useMutation(
    async () => {
      toast.loading('Waiting...');
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/slaughtering/${indexData.id}`,
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
        queryClient.invalidateQueries({ queryKey: ['getSlaughtering'] })
        handleCloseMenu(false)
      },
      onError: (err) => {
        toast.dismiss();
        toast.error('error!');
      },
    }
  );


  useEffect(() => {
    getMeat()
  }, [])
  

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
        <title> Slaughtering | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Slaughtering
          </Typography>
          <Button onClick={() => setOpenModal(true)} variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New Slaughtering
          </Button>
        </Stack>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} placeHolder={"Search slaughtering..."} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={data?.data?.slaughterings.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredSlaughterings?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const { id, slaughteringName, slaughteringVideo, isVerify, meatId, createdAt, updateAt} = row;
                    const selectedSlaughtering = selected.indexOf(slaughteringName) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} >
                        <TableCell>
                        {index + 1}
                        </TableCell> 

                        <TableCell >
                          {/* <Stack direction="row" alignItems="center" spacing={2}> */}
                            {/* <Avatar variant="rounded" alt={name} src={avatarUrl} sx={{ width: 72, height: 72 }} /> */}
                            <Typography variant="subtitle2" noWrap>
                              {slaughteringName}
                            </Typography>
                          {/* </Stack> */}
                        </TableCell>

                        <TableCell align="left">{slaughteringVideo}</TableCell>
                        <TableCell align="left">{meatId}</TableCell>

                        <TableCell align="left">
                          {
                            isVerify ? 
                            <Label color={'success'}>Approved </Label> : <Label color={'warning'}>Pending</Label>
                          }
                        </TableCell>

                        <TableCell align="left">{new Date(createdAt).toUTCString()}</TableCell>

                        <TableCell align="left">{new Date(updateAt).toUTCString()}</TableCell>

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
            rowsPerPageOptions={[1, 5, 10, 25]}
            component="div"
            count={data?.data?.slaughterings.length}
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

        <MenuItem sx={{ color: 'error.main' }} onClick={deleteSlaughtering}>
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
            Create Slaughtering
          </Typography>

          <Typography id="keep-mounted-modal-description" sx={{ mt: 2, marginBottom:'25px', display: 'flex', justifyContent: 'center' }}>
            Create a new slaughtering
          </Typography>

          <TextField value={createSlaughtering.slaughteringName} name='slaughteringName' onChange={handleCreateSlaughtering} fullWidth label="Slaughtering Name" sx={{  marginBottom:'15px'}} />
          <TextField
          id="outlined-select-currency"
          select
          label="Meat"
          helperText="Please select meat"
          sx={{  marginBottom:'15px'}}
          name='meatId'
          value={createSlaughtering.meatId} 
          onChange={handleCreateSlaughtering} 
          >
            {meatDropdown?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField value={createSlaughtering.slaughteringVideo} name='slaughteringVideo' onChange={handleCreateSlaughtering} fullWidth label="Slaughtering Video" sx={{  marginBottom:'15px'}} />

          <Button
            variant="text"
            component="label"
            fullWidth
            sx={{  mt: '20px'}}
            onClick={postSlaughtering}
            // onClose={() => setOpenModal(false)}
          >
            Create slaughtering
          </Button>
          
        </Box>
      </Modal>
    </>
  );
}
