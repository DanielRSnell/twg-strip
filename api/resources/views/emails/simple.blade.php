<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif; }
.container { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
.logo { text-align: center; padding-bottom: 24px; }
.card { background: #ffffff; border-radius: 12px; padding: 40px 32px; }
h1 { font-size: 22px; font-weight: 700; color: #18181b; margin: 0 0 16px; }
p { font-size: 15px; line-height: 1.6; color: #18181b; margin: 0 0 16px; }
.cta { display: inline-block; background: #18181b; color: #ffffff !important; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 8px; }
.footer { text-align: center; padding: 24px 0; font-size: 12px; color: #a1a1aa; }
</style>
</head>
<body>
<div class="container">
  <div class="logo">
    <img src="https://thiswayglobal.com/images/logo.png" alt="ThisWay Global" width="140">
  </div>
  <div class="card">
    <h1>{{ $heading }}</h1>
    @foreach(explode("\n", $body) as $line)
      <p>{{ $line }}</p>
    @endforeach
    @if($ctaUrl)
      <p><a href="{{ $ctaUrl }}" class="cta">{{ $ctaText }}</a></p>
    @endif
  </div>
  <div class="footer">ThisWay Global &middot; Austin, TX</div>
</div>
</body>
</html>
