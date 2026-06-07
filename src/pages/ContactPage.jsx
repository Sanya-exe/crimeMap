import { useState } from 'react'
import axios from 'axios'
import './ContactPage.css'

const BACKEND = 'http://127.0.0.1:5000'

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')
    try {
      const res = await axios.post(`${BACKEND}/contact`, form)
      if (res.data.success) {
        setSuccess('Message sent successfully! We will get back to you shortly.')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setError('Failed to send message. Please try again.')
      }
    } catch {
      setError('Failed to send message. Make sure the backend is running.')
    }
    setLoading(false)
  }

  const isValid = form.name && form.email && form.subject && form.message

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1><i className="fa-solid fa-envelope"></i> Contact Us</h1>
          <p>Have a question or feedback? Send us a message and we'll get back to you.</p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="What is this about?"
              required
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              rows={6}
              required
            />
          </div>

          {success && (
            <div className="alert success">
              <i className="fa-solid fa-circle-check"></i> {success}
            </div>
          )}
          {error && (
            <div className="alert error">
              <i className="fa-solid fa-triangle-exclamation"></i> {error}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading || !isValid}>
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Sending...</>
            ) : (
              <><i className="fa-solid fa-paper-plane"></i> Send Message</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ContactPage
