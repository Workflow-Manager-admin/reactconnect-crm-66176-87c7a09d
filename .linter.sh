#!/bin/bash
cd /home/kavia/workspace/code-generation/reactconnect-crm-66176-87c7a09d/reactconnect_crm
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

