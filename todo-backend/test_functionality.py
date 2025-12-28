import sys
from main import CommandLineInterface

# Test the application functionality
cli = CommandLineInterface()

print("=== Testing Add Command ===")
result = cli.parse_command(["add", "Buy groceries", "Milk, eggs, bread"])
print(result)

print("\n=== Testing Add Another Command ===")
result = cli.parse_command(["add", "Complete project", "Finish the hackathon project"])
print(result)

print("\n=== Testing List Command ===")
result = cli.parse_command(["list"])
print(result)

print("\n=== Testing Complete Command ===")
result = cli.parse_command(["complete", "1"])
print(result)

print("\n=== Testing List Command After Complete ===")
result = cli.parse_command(["list"])
print(result)

print("\n=== Testing Update Command ===")
result = cli.parse_command(["update", "2", "Complete hackathon project", "Finish the hackathon project with all requirements"])
print(result)

print("\n=== Testing List Command After Update ===")
result = cli.parse_command(["list"])
print(result)

print("\n=== Testing Delete Command ===")
result = cli.parse_command(["delete", "1"])
print(result)

print("\n=== Testing Final List Command ===")
result = cli.parse_command(["list"])
print(result)