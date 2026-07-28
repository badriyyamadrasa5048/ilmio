async function check() {
  const params = new URLSearchParams();
  params.append('username', 'parent1');
  params.append('password', 'parent123');

  const loginRes = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    body: params,
    redirect: 'manual'
  });

  const cookie = loginRes.headers.get('set-cookie');
  console.log('Login Cookie:', cookie);

  const res = await fetch('http://localhost:3000/dashboard', {
    headers: { 'Cookie': cookie }
  });

  console.log('Response Status:', res.status);
  const text = await res.text();
  console.log('Response Body:', text.slice(0, 1000));
}

check();
