const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-accent hover:bg-opacity-90 text-white shadow-lg shadow-accent/20',
    secondary: 'bg-secondary hover:bg-opacity-90 text-black shadow-lg shadow-secondary/20',
    outline: 'border border-white/10 hover:bg-white/5',
    error: 'bg-error text-white hover:bg-opacity-90',
  };

  return (
    <button className={`btn-base ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};


export default Button;
