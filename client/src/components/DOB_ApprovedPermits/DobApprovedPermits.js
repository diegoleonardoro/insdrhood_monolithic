import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';



// Helper functions for text formatting
const capitalizeWords = (str) => str ? str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : '';
const capitalizeFirstWord = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

const removeFirstDigit = (str) => str ? str.replace(/^\d/, '') : '';


const testFormatter = (str) => str ? str.toUpperCase() + " TEST" : '';

const formatDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '';
const formatDollars = (num) => num ? `$${parseInt(num).toLocaleString()}` : '';




// Styling for table cells
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    height: 60, // Set height for header cells

  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    height: 80, // Set height for body cells
    whiteSpace: "nowrap",
    width: 250,
    maxWidth: 250,
    overflow: "auto",
    wordWrap: "break-word",
    borderColor: "black",
    borderLeft: "black"
  },
}));



// Custom styled row for zebra striping
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },

}));



const columns = [
  { id: 'House Number', label: 'House Number', minWidth: 100, formatter: (value) => value },
  { id: 'Street Name', label: 'Street Name', minWidth: 170, formatter: capitalizeWords },
  { id: 'Borough', label: 'Borough', minWidth: 100, formatter: capitalizeFirstWord },
  { id: 'Community Board', label: 'Community Board', minWidth: 140, formatter: removeFirstDigit }, // Ensure this ID is exactly as it appears in your dataset
 // Typo is consistent with data

  { id: 'Work Floor', label: 'Work Floor', minWidth: 100, formatter: capitalizeFirstWord },
  { id: 'Work Type', label: 'Work Type', minWidth: 120, formatter: capitalizeFirstWord },
  { id: 'Applicant Business Name', label: 'Applicant Business Name', minWidth: 200, formatter: capitalizeWords },
  { id: 'Approved Date', label: 'Approved Date', minWidth: 130, formatter: formatDate },
  { id: 'Issued Date', label: 'Issued Date', minWidth: 130, formatter: formatDate },
  { id: 'Expired Date', label: 'Expired Date', minWidth: 130, formatter: formatDate },
  { id: 'Job Description', label: 'Job Description', minWidth: 200, formatter: capitalizeFirstWord },
  { id: 'Estimated Cost', label: 'Estimated Cost', minWidth: 150, formatter: formatDollars },
  { id: 'Owner Business Name', label: 'Owner Business Name', minWidth: 200, formatter: capitalizeWords }
];

const DOBApprovedPermits = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  console.log("dataa", data)

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    const fetchDOBApprovedPermits = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/dob_approved_permits`);

        console.log("response.data", response.data)

        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchDOBApprovedPermits();
  }, []);

  return (
    <Paper sx={{ width: '100%' }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell key={column.id} align='left'>{column.label}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <StyledTableRow hover role="checkbox" tabIndex={-1} key={index}>
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <StyledTableCell key={column.id}>{column.formatter ? column.formatter(value) : value}</StyledTableCell>
                  );
                })}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(+event.target.value);
          setPage(0);
        }}
      />
    </Paper>
  );
}

export default DOBApprovedPermits;