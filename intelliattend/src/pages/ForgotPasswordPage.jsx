import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStep(2);
        setSuccess('Verification code sent to your email (demo: 123456)');
      } catch {
        setError('Failed to send code. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      if (formData.code !== '123456') {
        setError('Invalid code. Demo code: 123456');
        return;
      }
      setStep(3);
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch {
        setError('Failed to reset password. Please try again.');
      } finally {
        setLoading(false);
      }
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
          <h1 className="font-display text-3xl font-bold text-primary mb-2">Reset Password</h1>
          <p className="text-muted">Securely reset your enterprise account password</p>
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
              {step === 3 && 'Step 3: New Password'}
            </div>
            <div className="text-center text-sm text-muted">
              {step === 1 && 'We\'ll send a verification code to your email'}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Create a new secure password'}
            </div>
          </div>

          {success && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted mt-2 text-center">Demo code: 123456</p>
              </div>
            )}

            {step === 3 && (
              <>
                <div>
                  <label htmlFor="password" className="input-label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className="input-field pl-10 pr-10"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <Lock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="input-label">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="input-field pl-10"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  {step === 1 ? 'Sending...' : step === 2 ? 'Verifying...' : 'Resetting...'}
                </>
              ) : (
                step === 1 ? 'Send Code' : step === 2 ? 'Verify Code' : 'Reset Password'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}