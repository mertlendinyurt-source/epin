#!/usr/bin/env python3
"""
Check what secret is actually being used by the backend
"""

import hashlib
from pymongo import MongoClient

# Get the order and security log
client = MongoClient("mongodb://localhost:27017")
db = client['pubg_uc_store']

order_id = "2a430198-310b-4999-8760-0b5867aa333a"
order = db.orders.find_one({"id": order_id})
security_log = db.payment_security_logs.find_one({"orderId": order_id})

if not order or not security_log:
    print("Order or security log not found")
    exit(1)

amount = order['amount']
expected_hash = security_log['expectedHash']

print(f"Order ID: {order_id}")
print(f"Amount: {amount}")
print(f"Expected hash (from backend): {expected_hash}")
print()

# Try to reverse engineer what secret was used
# We know: hash = SHA256(orderId + amount + secret)
# We need to find: secret

# Let's try different secrets
test_secrets = [
    "test_secret_abcdef",
    "test_api_key_67890",
    "test_merchant_12345",
    "",
    "production",
]

print("Trying different secrets:")
for secret in test_secrets:
    data = f"{order_id}{amount}{secret}"
    hash_result = hashlib.sha256(data.encode()).hexdigest()
    match = "✅ MATCH!" if hash_result == expected_hash else ""
    print(f"  Secret: '{secret}' -> {hash_result} {match}")

print()

# Let's also check what's actually stored in the database (encrypted)
settings = db.shopier_settings.find_one({"isActive": True})
if settings:
    print("Encrypted values in database:")
    print(f"  merchantId: {settings.get('merchantId')[:30]}...")
    print(f"  apiKey: {settings.get('apiKey')[:30]}...")
    print(f"  apiSecret: {settings.get('apiSecret')[:30]}...")
    print()
    
    # Try to decrypt using the same logic as the backend
    # We need to import the crypto module
    import sys
    sys.path.insert(0, '/app')
    
    try:
        # Import the decrypt function
        import subprocess
        result = subprocess.run(
            ['node', '-e', '''
            const crypto = require('crypto');
            const ALGORITHM = 'aes-256-gcm';
            const IV_LENGTH = 16;
            const AUTH_TAG_LENGTH = 16;
            
            function getMasterKey() {
              const masterKey = process.env.MASTER_ENCRYPTION_KEY;
              const hash = crypto.createHash('sha256');
              hash.update(masterKey);
              return hash.digest();
            }
            
            function decrypt(encryptedData) {
              const key = getMasterKey();
              const combined = Buffer.from(encryptedData, 'base64');
              const iv = combined.slice(0, IV_LENGTH);
              const authTag = combined.slice(-AUTH_TAG_LENGTH);
              const encrypted = combined.slice(IV_LENGTH, -AUTH_TAG_LENGTH);
              const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
              decipher.setAuthTag(authTag);
              let decrypted = decipher.update(encrypted, null, 'utf8');
              decrypted += decipher.final('utf8');
              return decrypted;
            }
            
            const encryptedSecret = process.argv[1];
            const decrypted = decrypt(encryptedSecret);
            console.log(decrypted);
            ''', settings.get('apiSecret')],
            capture_output=True,
            text=True,
            cwd='/app',
            env={'MASTER_ENCRYPTION_KEY': 'o6kPj1WqrrH/ZWdlwh/FXKnOZ02UdkyyxTmsKRy2j9w=', 'PATH': '/usr/local/bin:/usr/bin:/bin'}
        )
        
        if result.returncode == 0:
            decrypted_secret = result.stdout.strip()
            print(f"Decrypted API Secret: '{decrypted_secret}'")
            
            # Test with decrypted secret
            data = f"{order_id}{amount}{decrypted_secret}"
            hash_result = hashlib.sha256(data.encode()).hexdigest()
            match = "✅ MATCH!" if hash_result == expected_hash else "❌ NO MATCH"
            print(f"Hash with decrypted secret: {hash_result} {match}")
        else:
            print(f"Decryption failed: {result.stderr}")
    except Exception as e:
        print(f"Error decrypting: {e}")
