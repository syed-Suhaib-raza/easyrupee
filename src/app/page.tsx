export default function HomePage() {
  return (
    
    <div
  className="hero min-h-screen">
  <div className="hero-content text-neutral-content text-center">
    <div className="max-w-md">
      <h1 className="mb-5 text-7xl font-bold">EasyRupee</h1>
      <h3 className="mb-5 text-lg">Your finances simplified.</h3>
      <p className="mb-7">Send money, pay bills, and save securely, all from your phone. Ditch the queues and embrace effortless digital banking on your fingertips.</p>
      <h2 className="mb-5 text-2xl font-semibold">Your financial freedom is just a few clicks away!</h2>
      <div className="flex gap-4 justify-center">
      <a href="/login"><button className="btn btn-accent rounded-field">Login</button></a>
      <a href="/register"><button className="btn btn-neutral rounded-field">Register</button></a>
      </div>
    </div>
  </div>
</div>
  )
}