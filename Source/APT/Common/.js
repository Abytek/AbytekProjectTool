
const path = require("path");
const fs = require("fs");
const { execSync } = require('child_process');
const Ajv = require("ajv");
const crypto = require('crypto');
const deasync = require('deasync');

AMJS.Import("./Android");
AMJS.Import("./Assert");
AMJS.Import("./Git");
AMJS.Import("./ID");
AMJS.Import("./JSON");
AMJS.Import("./Object");
AMJS.Import("./Forward");
AMJS.Import("./Copy");
AMJS.Import("./Cache");
AMJS.Import("./Platform");
AMJS.Import("./Files");
AMJS.Import("./VisualStudio");
AMJS.Import("./CLI");