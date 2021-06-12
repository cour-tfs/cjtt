var app = new Vue({
	el: '#app',
	data: {
		GASEndpoint: 'https://script.google.com/a/24-7intouch.com/macros/s/AKfycbxbmjQqQ656GhnSMon6DInq5HMb1FiIjzXXB8CV/exec',
		email: '',
		business: '',
		jiraList: [],
		businesses: [],
		jira: '',
		newJira: '',
		report: '',
		ticket: '',
		forma: false,
		nuevoJira: false,
		reporte: false,
		error: false,
		cargando: true,
		logrado: false,
		fallado: false
	},
	methods: {
		change: function () {
			if (this.jira == 'new') {
				this.nuevoJira = true;
			} else if (this.jira != '') {
				this.nuevoJira = false;
				this.retrieveJIRA(this.jira);
			}

		},
		retrieveJIRA: function (jiraR) {
			var self = this;
			console.log(self.jira);
			if ((self.jira == '') && (self.newJira == '')) {
				self.error = true;
			} else {
				self.error = false;
				self.reporte = false;
				self.cargando = true;
				self.report = '';
				$.ajax({
					url: self.GASEndpoint + '?option=getDesc&AID=' + self.email + '&jira=' + jiraR,
					method: 'GET',
					success: function (data) {
						self.cargando = false;
						self.report = JSON.parse(data);
						self.reporte = true;
					},
					error: function (error) {
						self.cargando = false;
						console.log(error);
					}
				});
			}
		},
		trackTicket: function () {
			var self = this;
			self.error = false;
			self.ticket = parseInt(self.ticket);
			if (((self.jira != '') || (self.jira != 'new') || (self.newJira != '')) && (self.business != '') && (self.report.desc != '') && (self.ticket != '') && (self.report.ref != '') && (self.report.ref != '0') && Number.isInteger(self.ticket)) {
				self.cargando = true;
				if (self.jira == 'new') {
					var jirasent = self.newJira;
				} else {
					var jirasent = self.jira;
				}
				var ctrl = '' + Date.now();
				var p1 = '&jira=' + jirasent;
				var p2 = '&business=' + self.business;
				var p3 = '&ticket=' + self.ticket;
				var p4 = '&stamp=' + ctrl;
				var p5 = '&AID=' + self.email;
				var direccion = self.GASEndpoint + '?option=trackTicket' + p1 + p2 + p3 + p4 + p5;
				$.ajax({
					url: direccion,
					method: 'GET',
					success: function (data) {
						var espero = JSON.parse(data);
						if (espero.success && (espero.stamp == ctrl)) {
							self.cargando = false;
							self.forma = false;
							self.error = false;
							self.logrado = true;
						} else {
							self.cargando = false;
							self.fallado = true;
						}
					},
					error: function (error) {
						console.log(error)
						self.cargando = false;
						self.fallado = true;
					}
				});
			} else {
				self.error = true;
			}
		},
		getTab: function () {
			return new Promise((resolve,reject) => {
				try {
					chrome.tabs.query({
						active: true,
						currentWindow: true
						},
						function (tabs) {
							resolve(tabs[0].url);
						}
					)
				} catch (err) {
					reject(err);
				}
			})
		},
	},
	created: function () {
		var self = this;
		chrome.identity.getProfileUserInfo(function (info) {
			self.email = info.email;
			$.ajax({
				url: self.GASEndpoint + '?option=getList&AID=' + self.email,
				method: 'GET',
				success: function (data) {
					self.cargando = false;
					var intro = JSON.parse(data);
					console.log(intro);
					self.jiraList = intro["jiras"];
					self.businesses = intro["opts"]
					self.forma = true;
				},
				error: function (error) {
					console.log(error)
				}
			});
		});
		async function tabHolder() {
			let tempURL = await self.getTab();
			if (tempURL.includes('https://courserahelp.zendesk.com/agent/tickets/')) {
				var splitURL = tempURL.split('/');
				self.ticket = splitURL[splitURL.length - 1];
			}
		}
		tabHolder();
	}
})