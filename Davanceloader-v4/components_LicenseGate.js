import { useState, useEffect, useRef } from 'react';

const licenseText = `Freedom of MIT Personal Sequel License (fomPsL) 4.0

Copyright © 2026 turtleboyagain120. All rights reserved.

1. LICENSE GRANT
The owner hereby grants to the user a non-exclusive, worldwide, royalty-free license to access and use the software for any purpose, including but not limited to commercial and non-commercial use, subject to the strict compliance with the conditions set forth in this license (fomPsL 4.0).

2. CONDITIONS OF USE
The rights granted under this license are contingent upon the user's adherence to the following requirements:
(a) Copyright Preservation: The copyright notice must be maintained and preserved within a file named "Notice.copyright" included with the software.
(b) Endorsements: Any requests for endorsement of the software or its creator must be submitted in writing to timmytheonlinegirl@hotmail.com. No endorsement is granted unless explicit written approval is provided by the owner.
(c) Documentation of Changes: The user shall document every modification, update, or change made to the software within a file named "Changelog.txt".

3. COMPLIANCE AND TERMINATION
Any violation of the terms of this license constitutes a breach. In the event of a breach, the user shall have thirty (30) days from the date of notification by the owner to remedy such non-compliance ("Cure Period"). If the violation is not corrected within said 30-day period, all rights granted under this license and any associated permissions are immediately and automatically terminated.

4. PATENT GRANT AND TERMINATION
Each contributor grants you a perpetual, worldwide, non-exclusive, no-charge, royalty-free patent license to make, use, sell, and distribute the software. 
Patent Retaliation: If you initiate any patent litigation against any entity alleging that the software infringes a patent, your patent rights granted under this license shall terminate immediately and automatically.

5. DISCLAIMER OF WARRANTY AND LIMITATION OF LIABILITY
THE SOFTWARE IS PROVIDED "AS-IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. 

IN NO EVENT SHALL THE OWNER BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. THIS INCLUDES, BUT IS NOT LIMITED TO, DAMAGES FOR PERSONAL INJURY, INCIDENTAL DAMAGES, EXPRESS, IMPLIED, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. 

THE OWNER SHALL NOT BE LIABLE FOR ANY THIRD-PARTY DAMAGE, MISUSE OF THE SOFTWARE, OR UNAUTHORIZED ACTIVITIES TAKING PLACE WITHIN THE SCOPE OF THE WORK. THE OWNER IS NOT LIABLE FOR THE INCLUSION OF REAL CHARACTERS, NAMES, OR LOCATIONS, AS SUCH INFORMATION MAY BE INCORPORATED COINCIDENTALLY.

6. JURISDICTION
This license and any disputes arising from it shall be governed by and construed in accordance with the laws of the State of South Carolina, USA, without regard to its conflict of law provisions.`;

export default function LicenseGate({ onAgreed }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [timer, setTimer] = useState(3);
  const [canAgree, setCanAgree] = useState(false);
  const scrollRef = useRef(null);
  const timerRef = useRef(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    if (hasScrolledToBottom && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    if (timer === 0) {
      setCanAgree(true);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [hasScrolledToBottom, timer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">License Agreement</h1>
          <p className="text-gray-400">Please read and accept the fomPsL 4.0 License to continue</p>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="bg-gray-900 rounded-lg p-6 h-64 overflow-y-auto mb-6 text-sm text-gray-300 leading-relaxed"
          style={{ scrollBehavior: 'smooth' }}
        >
          <pre className="whitespace-pre-wrap font-sans">{licenseText}</pre>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {!hasScrolledToBottom
              ? 'Scroll to the bottom to continue...'
              : !canAgree
              ? `Please wait ${timer} seconds...`
              : 'You may now agree'}
          </div>
          <button
            onClick={onAgreed}
            disabled={!canAgree}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
              canAgree
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white cursor-pointer transform hover:scale-105'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canAgree ? 'I Agree' : `Wait ${timer}s`}
          </button>
        </div>
      </div>
    </div>
  );
}