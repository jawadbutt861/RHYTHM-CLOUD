import request from 'supertest'
import app from '../src/app.js'

describe('Auth endpoints',()=>{
  it('registers a user',async ()=>{
    const res = await request(app).post('/api/auth/register').send({username:'testuser',email:'test@example.com',password:'password123'})
    expect([200,201,409]).toContain(res.status)
  })
})
