with open('src/components/home-content.tsx', 'r') as f:
    content = f.read()

# The issue: closing backtick was replaced with double-quote
old = 'cursor-pointer group"}>'
new = 'cursor-pointer group`}>'
count = content.count(old)
print(f"Found {count} occurrences to fix")
content = content.replace(old, new)

with open('src/components/home-content.tsx', 'w') as f:
    f.write(content)
print("Fixed!")
