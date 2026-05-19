import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PasswordInput from '../../../components/PasswordInput';

const schema = yup.object({
  fullName:     yup.string().required('Full name is required'),
  businessName: yup.string().required('Business name is required'),
  email:        yup.string().email('Invalid email').required('Email is required'),
  mobileNumber: yup.string().matches(/^\+?[0-9]{7,15}$/, 'Invalid mobile number').required('Mobile is required'),
  userType:     yup.string().oneOf(['Retailer', 'WholeSaler', 'Distributor']).required('Select user type'),
  password:     yup.string()
    .min(8, 'Minimum 8 characters')
    .matches(/[A-Z]/, 'Must include uppercase')
    .matches(/[0-9]/, 'Must include number')
    .matches(/[^A-Za-z0-9]/, 'Must include special character')
    .required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords do not match').required(),
});

export default function AccountInfo({ data, onNext }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: data,
  });

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <div className="form-grid-2" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Full Name <span>*</span></label>
          <input id="fullName" className={`form-input${errors.fullName ? ' error' : ''}`} placeholder="John Smith" {...register('fullName')} />
          {errors.fullName && <p className="form-error">⚠ {errors.fullName.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="businessName">Business Name <span>*</span></label>
          <input id="businessName" className={`form-input${errors.businessName ? ' error' : ''}`} placeholder="TechStore LLC" {...register('businessName')} />
          {errors.businessName && <p className="form-error">⚠ {errors.businessName.message}</p>}
        </div>
      </div>
      <div className="form-grid-2" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address <span>*</span></label>
          <input id="email" type="email" className={`form-input${errors.email ? ' error' : ''}`} placeholder="you@business.com" {...register('email')} />
          {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="mobileNumber">Mobile Number <span>*</span></label>
          <input id="mobileNumber" className={`form-input${errors.mobileNumber ? ' error' : ''}`} placeholder="+971 50 123 4567" {...register('mobileNumber')} />
          {errors.mobileNumber && <p className="form-error">⚠ {errors.mobileNumber.message}</p>}
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 20 }}>
        <label className="form-label" htmlFor="userType">Seller Type <span>*</span></label>
        <select id="userType" className={`form-select${errors.userType ? ' error' : ''}`} {...register('userType')}>
          <option value="">Select seller type...</option>
          <option value="Retailer">Retailer</option>
          <option value="WholeSaler">Wholesaler</option>
          <option value="Distributor">Distributor</option>
        </select>
        {errors.userType && <p className="form-error">⚠ {errors.userType.message}</p>}
      </div>
      <div className="form-grid-2" style={{ marginBottom: 28 }}>
        <PasswordInput id="password" label="Password" register={register('password')} error={errors.password?.message} showStrength />
        <PasswordInput id="confirmPassword" label="Confirm Password" register={register('confirmPassword')} error={errors.confirmPassword?.message} />
      </div>
      <button type="submit" className="btn btn-primary btn-full">
        Continue →
      </button>
    </form>
  );
}