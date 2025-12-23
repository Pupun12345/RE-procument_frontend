// itemsService.ts
// Service for item-related API calls

import axios from '../api/axios';

// Example addItem function
export async function addItem(itemData: any) {
  try {
    const response = await axios.post('/items', itemData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}

// Fetch return records
export async function getReturnRecords() {
  try {
    const response = await axios.get('/return-records');
    return response.data;
  } catch (error) {
    console.error('Error fetching return records:', error);
    throw error;
  }
}

// Save a return record
export async function saveReturnRecord(record: any) {
  try {
    const response = await axios.post('/return-records', record);
    return response.data;
  } catch (error) {
    console.error('Error saving return record:', error);
    throw error;
  }
}

// Delete a return record
export async function deleteReturnRecord(recordId: string) {
  try {
    const response = await axios.delete(`/return-records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting return record:', error);
    throw error;
  }
}

// Add more item-related service functions as needed
