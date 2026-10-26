import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      setMessage('Thanks for reaching out! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', organization: '', message: '' });
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again or email us directly.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-primary">IntelliAttend</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-sm font-medium text-muted hover:text-primary transition-colors">Features</Link>
              <Link to="/products/smartboard" className="text-sm font-medium text-muted hover:text-primary transition-colors">SmartBoard</Link>
              <Link to="/products/faculty" className="text-sm font-medium text-muted hover:text-primary transition-colors">Faculty</Link>
              <Link to="/products/student" className="text-sm font-medium text-muted hover:text-primary transition-colors">Student</Link>
              <Link to="/pricing" className="text-sm font-medium text-muted hover:text-primary transition-colors">Pricing</Link>
              <Link to="/about" className="text-sm font-medium text-muted hover:text-primary transition-colors">About</Link>
              <Link to="/blog" className="text-sm font-medium text-muted hover:text-primary transition-colors">Blog</Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">Log in</Link>
              <Link to="/get-started" className="btn-primary w-auto h-10 px-6 text-sm">Get Started</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        <section className="py-20 lg:py-32" aria-labelledby="contact-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h1 id="contact-heading" className="page-title mb-6">Let's talk about your campus.</h1>
                <p className="text-lg text-muted max-w-md mb-10">Whether you're looking for a custom enterprise solution or just want to see a live demo, our team is ready to help.</p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Email</h4>
                      <p className="text-muted"><a href="mailto:hello@intelliattend.com" className="hover:text-primary transition-colors">hello@intelliattend.com</a></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Phone</h4>
                      <p className="text-muted">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Address</h4>
                      <p className="text-muted">100 Innovation Drive, Tech City, CA</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary-light/50 rounded-[32px] transform rotate-3 scale-105" />
                <div className="card-elevated p-10 relative">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="input-label">Full Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Dr. Sarah Jenkins"
                        className="input-field"
                        disabled={status === 'loading'}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="input-label">Email</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="sarah@university.edu"
                          className="input-field"
                          disabled={status === 'loading'}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="organization" className="input-label">Organization</label>
                        <input
                          id="organization"
                          name="organization"
                          type="text"
                          value={formData.organization}
                          onChange={handleChange}
                          required
                          placeholder="Tech University"
                          className="input-field"
                          disabled={status === 'loading'}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="input-label">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your campus needs..."
                        className="input-field resize-none"
                        disabled={status === 'loading'}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-4 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {status === 'loading' ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="h-5 w-5" />
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                  {message && (
                    <div className={`mt-6 flex items-center gap-3 p-4 rounded-xl ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {status === 'success' ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                      <span>{message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-primary">IntelliAttend</span>
              </Link>
              <p className="text-sm text-muted mb-6 max-w-xs">The intelligent foundation for modern educational institutions.</p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-sm text-muted hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/get-started" className="text-sm text-muted hover:text-primary transition-colors">Get Started</Link></li>
                <li><Link href="/products/smartboard" className="text-sm text-muted hover:text-primary transition-colors">SmartBoard</Link></li>
                <li><Link href="/products/faculty" className="text-sm text-muted hover:text-primary transition-colors">Faculty</Link></li>
                <li><Link href="/products/student" className="text-sm text-muted hover:text-primary transition-colors">Student</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-muted hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-sm text-muted hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-sm text-muted hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="text-sm text-muted hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/support" className="text-sm text-muted hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-sm text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-sm text-muted hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted">© 2026 IntelliAttend Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}