export default function HomePage() {
  return (
    <div
  className="hero max-h-screen max-w-screen"
  style={{
    backgroundImage:
      "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)",
  }}
>
  <div className="hero-overlay"></div>
  <div className="hero-content text-neutral-content text-center">
    <div className="max-w-md">
      <h1 className="mb-5 text-5xl font-bold">EasyRupee</h1>
      <div className="flex gap-4 justify-center">
      <a href="/login"><button className="btn btn-accent rounded-field">Login</button></a>
      <a href="/register"><button className="btn btn-neutral rounded-field">Register</button></a>
      </div>
    </div>
  </div>
</div>
  )
}