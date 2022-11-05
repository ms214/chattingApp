
function register(){
	const registerForm = document.getElementById("form_register");
	const id=document.getElementById("id");
	const pw1= document.getElementById("pw1");
	const pw2 = document.getElementById("pw2");
	const name = document.getElementById("name");
	
	pw1.value = sha256(pw1.value);
	pw2.value = sha256(pw2.value);
	registerForm.method="POST";
	registerForm.action="/register_progress";
	registerForm.submit();
}

function login(){
	const send = document.getElementById("loginForm");
	const form = document.getElementById("mainForm");
	const id = document.getElementById("id");
	const pw = document.getElementById("pw");
	
	pw.value=sha256(pw.value);	
	form.method="POST";
	form.action="/login_progress";
	form.submit();
}