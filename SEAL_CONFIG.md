# Seal Encryption Configuration for Finix
# 
# Set these environment variables in Vercel:
# 
# NEXT_PUBLIC_SEAL_KEY_SERVER_OBJECT_ID
#   Object ID of the key server on Sui mainnet.
#   For RubyNodes Free plan (Open mode), the key server is permissionless.
#   Try this Walrus system package first:
#   0x0000000000000000000000000000000000000000000000000000000000000002
#
#   If that doesn't work, try the committee key server object:
#   0xb012378c9f3799fb5b1a7083da74a4069e3c3f1c93de0b27212a5799ce1e1e98
#
# NEXT_PUBLIC_SEAL_KEY_SERVER_AGGREGATOR_URL
#   The URL of the key server aggregator (from your subscription dashboard).
#   Your current plan (Free - Europe):
#   https://free-eu-central-1.api.rubynodes.io
#
# NEXT_PUBLIC_SEAL_API_KEY
#   Your API key from the Seal dashboard.
#   Ba4FTizw47deIiMdUdgZQmOGs5nnvOrMK9Loqj1T
#
# SETUP INSTRUCTIONS:
# 1. Go to https://vercel.com/oktavian3/finix/settings/environment-variables
# 2. Add all 3 variables above
# 3. Redeploy or push to trigger auto-deploy
