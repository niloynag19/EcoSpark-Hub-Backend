import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/ideas/featured');
    console.log('Success:', res.data);
  } catch (error: any) {
    console.error('Error:', error.response?.status, error.response?.data);
  }
}

test();
