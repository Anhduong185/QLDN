const API = '/api/don-nghi-phep';

export const nghiPhepService = {
  async create(data) {
    const res = await fetch(`${API}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async approve(id) {
    const res = await fetch(`${API}/${id}/approve`, { method: 'PATCH' });
    return res.json();
  },
  async getList(params) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API}?${query}`);
    return res.json();
  }
}; 