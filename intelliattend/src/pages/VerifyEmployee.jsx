import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function VerifyEmployee() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (step === 1) {
      setStatus('success');
      setMessage('Verification code sent to your email');
      setTimeout(() => {
        setStep(2);
        setStatus('idle');
      }, 1500);
    } else if (step === 2) {
      if (formData.code && formData.code.trim().length === 6) {
        setStatus('success');
        setMessage('Code verified successfully');
        setTimeout(() => {
          setStep(3);
          setStatus('idle');
        }, 1200);
      } else {
        setStatus('error');
        setMessage('Invalid verification code. Please check your email.');
      }
    } else {
      setStatus('success');
      setMessage('Account created! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-primary-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-3 mb-6 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200">
            <img src="/logo.png" alt="IntelliAttend Logo" className="h-9 w-auto object-contain" />
            <span className="font-display font-bold text-xl text-slate-900 tracking-tight leading-none">IntelliAttend</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-primary mb-2">Verify Your Account</h1>
          <p className="text-muted">Complete your employee registration</p>
        </div>

        <div className="card-elevated p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step > s ? 'bg-accent text-white' : step === s ? 'bg-primary text-white' : 'bg-slate-200 text-muted'
                  }`}
                >
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 rounded ${step > s ? 'bg-accent' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-6">
            <div className="text-center text-sm font-medium text-primary">
              {step === 1 && 'Step 1: Enter Email'}
              {step === 2 && 'Step 2: Verify Code'}
              {step === 3 && 'Step 3: Set Password'}
            </div>
            <div className="text-center text-sm text-muted">
              {step === 1 && 'We\'ll send a verification code to your email'}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Create a secure password for your account'}
            </div>
          </div>

          {message && (
            <div className={`mb-6 flex items-center gap-3 p-4 rounded-xl ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {status === 'success' ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div>
                <label htmlFor="email" className="input-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                    placeholder="rahulbariki.intelliattend@gmail.com"
                    disabled={status === 'loading'}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <label htmlFor="code" className="input-label">Verification Code</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    id="code"
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    className="input-field pl-10 text-center tracking-widest text-lg"
                    placeholder="••••••"
                    disabled={status === 'loading'}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <>
                <div>
                  <label htmlFor="password" className="input-label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className="input-field pl-10"
                      placeholder="••••••••"
                      disabled={status === 'loading'}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="input-field pl-10"
                      placeholder="••••••••"
                      disabled={status === 'loading'}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  {step === 1 ? 'Sending...' : step === 2 ? 'Verifying...' : 'Creating...'}
                </>
              ) : (
                step === 1 ? 'Send Code' : step === 2 ? 'Verify Code' : 'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}